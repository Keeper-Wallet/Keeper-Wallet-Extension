import { extension } from 'lib/extension';
import ObservableStore from 'obs-store';

const IDLE_INTERVAL = 60;

export class IdleController {
  constructor({ initState, preferencesController, vaultController }) {
    extension.idle.setDetectionInterval(IDLE_INTERVAL);
    this.options = {
      type: 'idle',
      interval: 15 * 60 * 1000,
      ...preferencesController.store.getState().idleOptions,
    };
    this.preferencesController = preferencesController;
    this.vaultController = vaultController;
    this.lastUpdateIdle = Date.now();
    this.store = new ObservableStore(
      Object.assign({}, { lastUpdateIdle: this.lastUpdateIdle }, initState)
    );
    this.start();

    extension.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'idle') {
        this.start();
      }
    });
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    this.preferencesController.setIdleOptions(this.options);
    this.start();
  }

  start() {
    this._idleMode();
    this._tmrMode();
  }

  update() {
    this.lastUpdateIdle = Date.now();
    this.store.updateState({ lastUpdateIdle: this.lastUpdateIdle });
    this.start();
  }

  _tmrMode() {
    if (this.options.type === 'idle') {
      return;
    }

    const time = Date.now() - this.lastUpdateIdle - this.options.interval;
    if (time > 0) {
      this._lock('locked');
    }

    extension.alarms.create('idle', {
      delayInMinutes: 5 / 60,
    });
  }

  _idleMode() {
    if (this.options.type !== 'idle') {
      extension.idle.onStateChanged.removeListener(this._lock);
    } else {
      extension.idle.onStateChanged.addListener(this._lock);
    }
  }

  _lock = state => {
    if (['idle', 'locked'].indexOf(state) > -1) {
      this.vaultController.lock();
    }
  };
}
