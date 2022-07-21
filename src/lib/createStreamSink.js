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
    promiseToCallback(this._asyncWriteFn(chunk, encoding))(callback);
  }
}

function promiseToCallback(promise) {
  if (!(typeof promise.then === 'function')) {
    throw new TypeError('Expected a promise');
  }

  return function (cb) {
    promise.then(
      function (data) {
        setTimeout(cb, 0, null, data);
      },
      function (err) {
        setTimeout(cb, 0, err);
      }
    );
  };
}
