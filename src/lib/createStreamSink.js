const WritableStream = require('readable-stream').Writable;

export function createStreamSink(asyncWriteFn, _opts) {
  return new AsyncWritableStream(asyncWriteFn, _opts);
}

class AsyncWritableStream extends WritableStream {
  constructor(asyncWriteFn, _opts) {
    const opts = Object.assign({ objectMode: true }, _opts);
    super(opts);
    this._asyncWriteFn = asyncWriteFn;
  }

  // write from incomming stream to state
  _write(chunk, encoding, callback) {
    this._asyncWriteFn(chunk, encoding).then(
      data => {
        callback(null, data);
      },
      err => {
        callback(err);
      }
    );
  }
}
