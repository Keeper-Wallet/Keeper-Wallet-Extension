import ObservableStore from 'obs-store';
import { type IdleOptions } from 'preferences/types';
import Browser from 'webextension-polyfill';

import { type ExtensionStorage } from '../storage/storage';
import { type PreferencesController } from './preferences';
import { type VaultController } from './VaultController';

const IDLE_INTERVAL = 60;

export class IdleController {
  private options: IdleOptions;
  private preferencesController;
  private vaultController;
  private store;
  private lastUpdateIdle;

  constructor({
    extensionStorage,
    preferencesController,
    vaultController,
  }: {
    extensionStorage: ExtensionStorage;
    preferencesController: PreferencesController;
    vaultController: VaultController;
  }) {
    Browser.idle.setDetectionInterval(IDLE_INTERVAL);
    this.options = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      type: 'idle',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      interval: 15 * 60 * 1000,
      ...preferencesController.store.getState().idleOptions,
    };
    this.preferencesController = preferencesController;
    this.vaultController = vaultController;
    this.store = new ObservableStore(
      extensionStorage.getInitState({ lastUpdateIdle: Date.now() }),
    );
    this.lastUpdateIdle = this.store.getState().lastUpdateIdle;
    extensionStorage.subscribe(this.store);
    this.start();

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'idle') {
        this.start();
      }
    });
  }

  setOptions(options: IdleOptions) {
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

    Browser.alarms.create('idle', {
      delayInMinutes: 5 / 60,
    });
  }

  _idleMode() {
    if (this.options.type !== 'idle') {
      Browser.idle.onStateChanged.removeListener(this._lock);
    } else {
      Browser.idle.onStateChanged.addListener(this._lock);
    }
  }

  _lock = (state: string) => {
    if (['idle', 'locked'].indexOf(state) > -1) {
      this.vaultController.lock();
    }
  };
}
