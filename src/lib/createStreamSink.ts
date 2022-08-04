import { Writable } from 'readable-stream';

type AsyncWriteFn<T> = (value: T) => Promise<unknown>;

export function createStreamSink<T>(asyncWriteFn: AsyncWriteFn<T>) {
  return new AsyncWritableStream(asyncWriteFn);
}

class AsyncWritableStream<T> extends Writable {
  private _asyncWriteFn: AsyncWriteFn<T>;

  constructor(asyncWriteFn: AsyncWriteFn<T>) {
    super({ objectMode: true });
    this._asyncWriteFn = asyncWriteFn;
  }

  _write(
    chunk: T,
    _encoding: string,
    callback: { (err: null, data: unknown): void; (err: Error): void }
  ) {
    this._asyncWriteFn(chunk).then(
      data => {
        callback(null, data);
      },
      err => {
        callback(err);
      }
    );
  }
}
