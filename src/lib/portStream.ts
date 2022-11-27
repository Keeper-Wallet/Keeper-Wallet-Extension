import { Duplex } from 'readable-stream';
import type Browser from 'webextension-polyfill';

export class PortStream extends Duplex {
  private _port;

  constructor(port: Browser.Runtime.Port) {
    super({ objectMode: true });
    this._port = port;

    port.onMessage.addListener(msg => {
      if (Buffer.isBuffer(msg)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete msg._isBuffer;
        const data = new Buffer(msg);
        this.push(data);
      } else {
        this.push(msg);
      }
    });

    port.onDisconnect.addListener(() => {
      this.destroy();
    });
  }

  _read() {
    // noop
  }

  _write(msg: object, _encoding: string, cb: (err?: Error) => void) {
    try {
      if (Buffer.isBuffer(msg)) {
        const data = msg.toJSON();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data._isBuffer = true;
        this._port.postMessage(data);
      } else {
        this._port.postMessage(msg);
      }
    } catch (err) {
      return cb(new Error('PortStream - disconnected'));
    }

    cb();
  }
}
