import BigNumber from '@waves/bignumber';
import { Asset } from '@waves/data-entities';
import { base64Encode } from '@waves/ts-lib-crypto';
import {
  SwapAssetsCallArg,
  SwapAssetsInvokeParams,
} from 'controllers/SwapController';
import Long from 'long';
import * as protobuf from 'protobufjs/minimal';
import { proto } from './channel.proto.compiled';

protobuf.util.Long = Long;
protobuf.configure();

type ExchangeChannelResult =
  | {
      type: 'error';
      code: proto.Response.Error.CODES;
    }
  | {
      type: 'data';
      invoke: SwapAssetsInvokeParams;
      priceImpact: number;
      toAmountCoins: BigNumber;
    };

interface ExchangeInput {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  slippageTolerance: number;
  toAsset: Asset;
  address: string;
}

interface ExchangeRequest extends ExchangeInput {
  id: string;
}

class ExchangeChannelConnectionError {}

type Subscriber = (
  err: ExchangeChannelConnectionError | null,
  vendor?: string,
  response?: ExchangeChannelResult
) => void;

function convertArg(
  arg: proto.Response.Exchange.Transaction.Argument
): SwapAssetsCallArg {
  switch (arg.value) {
    case 'integerValue':
      return {
        type: 'integer',
        value: new BigNumber(String(arg.integerValue)),
      };
    case 'binaryValue':
      return {
        type: 'binary',
        value: `base64:${base64Encode(arg.binaryValue)}`,
      };
    case 'stringValue':
      return {
        type: 'string',
        value: arg.stringValue,
      };
    case 'booleanValue':
      return {
        type: 'boolean',
        value: arg.booleanValue,
      };
    case 'list':
      return {
        type: 'list',
        value: arg.list.items.map(convertArg),
      };
    default:
      throw new Error(`Unexpected value of arg.value: ${arg.value}`);
  }
}

export class ExchangeChannelClient {
  private activeRequest: ExchangeRequest | null = null;
  private closedByUser = false;
  private nextId = 1;
  private reconnectTimeout: number | null = null;
  private subscriber: Subscriber | null = null;
  private url: string;
  private ws: WebSocket | null = null;

  constructor(url: string) {
    this.url = url;
  }

  private connect() {
    if (this.ws) {
      return;
    }

    this.ws = new WebSocket(this.url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      if (this.activeRequest) {
        this.send();
      }
    };

    this.ws.onmessage = event => {
      if (!this.activeRequest || !this.subscriber) {
        return;
      }

      const res = proto.Response.decode(new Uint8Array(event.data));

      if (res.id !== this.activeRequest.id) {
        return;
      }

      switch (res.exchange.result) {
        case 'data':
          this.subscriber(null, res.exchange.vendor, {
            type: 'data',
            invoke: {
              dApp: res.exchange.data.transaction.dApp,
              function: res.exchange.data.transaction.call.function,
              args: res.exchange.data.transaction.call.arguments.map(
                convertArg
              ),
            },
            priceImpact: res.exchange.data.priceImpact,
            toAmountCoins: new BigNumber(String(res.exchange.data.amount)),
          });
          break;
        case 'error':
          this.subscriber(null, res.exchange.vendor, {
            type: 'error',
            code: res.exchange.error.code,
          });
          break;
        default:
          throw new Error(
            `Unexpected value of res.exchange.result: ${res.exchange.result}`
          );
      }
    };

    this.ws.onclose = () => {
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onclose = null;
        this.ws = null;
      }

      if (this.closedByUser) {
        return;
      }

      if (this.subscriber) {
        this.subscriber(new ExchangeChannelConnectionError());
      }

      this.reconnectTimeout = window.setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  private send() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const {
        fromAmountCoins,
        id,
        fromAsset,
        slippageTolerance,
        toAsset,
        address,
      } = this.activeRequest;

      const encoded = proto.Request.encode(
        proto.Request.create({
          exchange: proto.Request.Exchange.create({
            amount: Long.fromString(fromAmountCoins.toFixed()),
            id,
            slippageTolerance,
            source: fromAsset.id,
            target: toAsset.id,
            address: address,
          }),
        })
      ).finish();

      this.ws.send(encoded);
    } else {
      this.connect();
    }
  }

  exchange(input: ExchangeInput, subscriber: Subscriber) {
    this.activeRequest = { ...input, id: String(this.nextId++) };
    this.subscriber = subscriber;
    this.send();

    return () => {
      this.activeRequest = null;
      this.subscriber = null;
    };
  }

  close() {
    this.closedByUser = true;

    if (this.ws) {
      this.ws.close();
    }

    if (this.reconnectTimeout != null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
