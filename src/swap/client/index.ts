import { BigNumber } from '@waves/bignumber';
import { base64Encode } from '@waves/ts-lib-crypto';
import Long from 'long';
import * as protobuf from 'protobufjs/minimal';
import { proto } from './messages.proto.compiled';

protobuf.util.Long = Long;
protobuf.configure();

type SwapClientCallArg =
  | { type: 'integer'; value: BigNumber }
  | { type: 'binary'; value: string }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'list'; value: SwapClientCallArg[] };

export interface SwapClientInvokeParams {
  dApp: string;
  function: string;
  args: SwapClientCallArg[];
}

export type SwapClientErrorCode = proto.Response.Error.CODES;
export const SwapClientErrorCode = proto.Response.Error.CODES;

export type SwapClientResponse =
  | {
      type: 'error';
      code: SwapClientErrorCode;
    }
  | {
      type: 'data';
      invoke: SwapClientInvokeParams;
      priceImpact: number;
      toAmountCoins: BigNumber;
    };

interface SwapParams {
  address: string;
  fromAmountCoins: BigNumber;
  fromAssetId: string;
  slippageTolerance: number;
  toAssetId: string;
}

interface SwapClientRequest extends SwapParams {
  id: string;
}

export class SwapClientConnectionError {}

type Subscriber = (
  err: SwapClientConnectionError | null,
  vendor?: string,
  response?: SwapClientResponse
) => void;

function convertArg(
  arg: proto.Response.Exchange.Transaction.Argument
): SwapClientCallArg {
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

export class SwapClient {
  private activeRequest: SwapClientRequest | null = null;
  private closedByUser = false;
  private nextId = 1;
  private reconnectTimeout: number | null = null;
  private subscribers: Subscriber[] = [];
  private ws: WebSocket | null = null;

  private connect() {
    if (this.ws) {
      return;
    }

    this.ws = new WebSocket('wss://keeper-swap.wvservices.com/v2');
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      if (this.activeRequest) {
        this.send();
      }
    };

    this.ws.onmessage = event => {
      if (!this.activeRequest) {
        return;
      }

      const res = proto.Response.decode(new Uint8Array(event.data));

      if (res.id !== this.activeRequest.id) {
        return;
      }

      switch (res.exchange.result) {
        case 'data':
          this.subscribers.forEach(subscriber => {
            subscriber(null, res.exchange.vendor, {
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
          });
          break;
        case 'error':
          this.subscribers.forEach(subscriber => {
            subscriber(null, res.exchange.vendor, {
              type: 'error',
              code: res.exchange.error.code,
            });
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

      this.subscribers.forEach(subscriber => {
        subscriber(new SwapClientConnectionError());
      });

      this.reconnectTimeout = window.setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  private send() {
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.activeRequest
    ) {
      const {
        address,
        fromAmountCoins,
        id,
        fromAssetId,
        slippageTolerance,
        toAssetId,
      } = this.activeRequest;

      const encoded = proto.Request.encode(
        proto.Request.create({
          exchange: proto.Request.Exchange.create({
            address: address,
            amount: Long.fromString(fromAmountCoins.toFixed()),
            id,
            slippageTolerance,
            source: fromAssetId,
            target: toAssetId,
          }),
        })
      ).finish();

      this.ws.send(encoded);
    } else {
      this.connect();
    }
  }

  setSwapParams(params: SwapParams) {
    this.activeRequest = { ...params, id: String(this.nextId++) };
    this.send();
  }

  subscribe(subscriber: Subscriber) {
    if (this.subscribers.indexOf(subscriber) === -1) {
      this.subscribers.push(subscriber);
    }

    return () => {
      const index = this.subscribers.indexOf(subscriber);

      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
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
