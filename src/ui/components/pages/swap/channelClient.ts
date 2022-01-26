import BigNumber from '@waves/bignumber';
import { Asset } from '@waves/data-entities';
import Long from 'long';
import { proto } from './channel.proto.compiled';

export interface ExchangePool {
  dApp: string;
  service: string;
  fromAssetId: string;
  toAssetId: string;
}

interface ExchangeResponse {
  priceImpact: number;
  priceSaved: number;
  route: ExchangePool[];
  toAmountCoins: BigNumber;
}

interface ExchangeInput {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  toAsset: Asset;
}

interface ExchangeRequest extends ExchangeInput {
  id: string;
}

type Subscriber = (err: Error | null, response?: ExchangeResponse) => void;

export enum ExchangeChannelErrorCode {
  ConnectionError = 'CONNECTION_ERROR',
  ExchangeError = 'EXCHANGE_ERROR',
}

export class ExchangeChannelError extends Error {
  code: ExchangeChannelErrorCode;

  constructor(code: ExchangeChannelErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export class ExchangeChannelClient {
  private activeRequest: ExchangeRequest | null = null;
  private closedByUser = false;
  private nextId = 1;
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

      if (res.exchange.result) {
        const { amount, priceImpact, priceSaved, route } = res.exchange.result;

        this.subscriber(null, {
          priceImpact,
          priceSaved,
          route: route.map(({ address, key, source, target }) => ({
            dApp: address,
            service: key,
            fromAssetId: source,
            toAssetId: target,
          })),
          toAmountCoins: new BigNumber(String(amount)),
        });
      } else {
        this.subscriber(
          new ExchangeChannelError(
            ExchangeChannelErrorCode.ExchangeError,
            res.exchange.errors.join('\n')
          )
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
        this.subscriber(
          new ExchangeChannelError(
            ExchangeChannelErrorCode.ConnectionError,
            'Could not connect to exchange channel'
          )
        );
      }

      setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  private send() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const { fromAmountCoins, id, fromAsset, toAsset } = this.activeRequest;

      const encoded = proto.Request.encode(
        proto.Request.create({
          exchange: proto.Request.Exchange.create({
            amount: Long.fromString(fromAmountCoins.toFixed()),
            id,
            source: fromAsset.id,
            target: toAsset.id,
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
    this.ws.close();
  }
}
