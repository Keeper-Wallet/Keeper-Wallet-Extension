import BigNumber from '@waves/bignumber';
import { Asset } from '@waves/data-entities';
import Long from 'long';
import { proto } from './channel.proto.compiled';

export interface ExchangePool {
  dApp: string;
  estimatedAmount: BigNumber;
  fromAssetId: string;
  toAssetId: string;
  type: string;
  vendor: string;
}

interface ExchangeResponse {
  priceImpact: number;
  route: ExchangePool[];
  toAmountCoins: BigNumber;
  worstAmountCoins: BigNumber;
}

interface ExchangeInput {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  toAsset: Asset;
}

interface ExchangeRequest extends ExchangeInput {
  id: string;
}

export enum ExchangeChannelErrorType {
  ConnectionError = 'CONNECTION_ERROR',
  ExchangeError = 'EXCHANGE_ERROR',
}

export enum ExchangeChannelErrorCode {
  INVALID_ASSET_PAIR = 'INVALID_ASSET_PAIR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export class ExchangeChannelError {
  type: ExchangeChannelErrorType;
  code: string;

  constructor(
    type: ExchangeChannelErrorType,
    code = ExchangeChannelErrorCode.UNEXPECTED_ERROR
  ) {
    this.type = type;
    this.code = code;
  }
}

type Subscriber = (
  err: ExchangeChannelError | null,
  response?: ExchangeResponse
) => void;

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

      if (res.exchange.result) {
        const { amount, priceImpact, route, worstAmount } = res.exchange.result;

        this.subscriber(null, {
          priceImpact,
          route: route.map(
            ({
              address,
              estimatedAmount,
              source,
              target,
              type,
              vendor,
            }): ExchangePool => ({
              dApp: address,
              estimatedAmount: new BigNumber(String(estimatedAmount)),
              fromAssetId: source,
              toAssetId: target,
              type,
              vendor,
            })
          ),
          toAmountCoins: new BigNumber(String(amount)),
          worstAmountCoins: new BigNumber(String(worstAmount)),
        });
      } else {
        const errMsg = res.exchange.errors[0];

        const code = Object.values(ExchangeChannelErrorCode).includes(
          errMsg as ExchangeChannelErrorCode
        )
          ? (errMsg as ExchangeChannelErrorCode)
          : undefined;

        this.subscriber(
          new ExchangeChannelError(ExchangeChannelErrorType.ExchangeError, code)
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
          new ExchangeChannelError(ExchangeChannelErrorType.ConnectionError)
        );
      }

      this.reconnectTimeout = window.setTimeout(() => {
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

    if (this.ws) {
      this.ws.close();
    }

    if (this.reconnectTimeout != null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
