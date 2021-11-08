import extension from 'extensionizer';

const IDLE_INTERVAL = 60;

export class IdleController {
  lastUpdate = Date.now();
  options = { type: 'idle', interval: 15 * 60 * 1000 };
  tmr = 0;

  static isEdge = window.navigator.userAgent.indexOf('Edge') > -1;

  constructor({ options, backgroundService }) {
    extension.idle.setDetectionInterval(IDLE_INTERVAL);
    this.backgroundService = backgroundService;
    this.options =
      backgroundService.preferencesController.store.getState().idleOptions;
    this.setOptions(options);
    this.start();
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    this.backgroundService.preferencesController.setIdleOptions(this.options);
    this.start();
  }

  start() {
    this._idleMode();
    this._tmrMode();
  }

  update() {
    clearTimeout(this.tmr);
    this.lastUpdate = Date.now();
    this.start();
  }

  _tmrMode() {
    if (this.options.type === 'idle') {
      return;
    }

    clearTimeout(this.tmr);

    const time = Date.now() - this.lastUpdate - this.options.interval;
    if (time > 0) {
      this._lock('locked');
    }

    this.tmr = setTimeout(() => this.start(), 5000);
  }

  _idleMode() {
    if (IdleController.isEdge) {
      this._msIdle();
      return;
    }

    if (this.options.type !== 'idle') {
      extension.idle.onStateChanged.removeListener(this._lock);
    } else {
      extension.idle.onStateChanged.addListener(this._lock);
    }
  }

  _msIdle() {
    if (this.options.type === 'idle') {
      extension.idle.queryState(IDLE_INTERVAL, this._lock);
      clearTimeout(this.tmr);
      this.tmr = setTimeout(() => this.start(), 10000);
    }
  }

  _lock = state => {
    if (['idle', 'locked'].indexOf(state) > -1) {
      this.backgroundService.walletController.lock();
    }
  };
}
