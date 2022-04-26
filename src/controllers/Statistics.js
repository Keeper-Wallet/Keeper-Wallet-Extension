import * as Sentry from '@sentry/react';
import ObservableStore from 'obs-store';
import { libs } from '@waves/waves-transactions';
import { statisticsApiKey } from '../../config.json';
import { extension } from 'lib/extension';
import { detect } from '../lib/detectBrowser';
import { KEEPERWALLET_ENV } from '../constants';

export class StatisticsController {
  events = [];
  sended = Promise.resolve();
  _idle = 0;

  constructor({ localStore, networkController }) {
    const defaults = {
      lastIdleKeeper: undefined,
      lastInstallKeeper: undefined,
      lastOpenKeeper: undefined,
      userId: undefined,
    };
    const initState = localStore.getInitState(defaults);
    const userId = initState.userId || StatisticsController.createUserId();
    Sentry.setUser({ id: userId });
    this.store = new ObservableStore({ ...initState, userId });
    localStore.subscribe(this.store);

    this.networkController = networkController;
    this.version = extension.runtime.getManifest().version;
    this.id = extension.runtime.id;
    this.browser = detect();
    this.sendInstallEvent();
    this.sendIdleEvent();

    extension.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'idleEvent') {
        this.sendIdleEvent();
      }
    });
  }

  static createUserId() {
    const date = Date.now();
    const random = Math.round(Math.random() * 1000000000);
    return libs.crypto.base58Encode(
      libs.crypto.sha256(libs.crypto.stringToBytes(`${date}-${random}`))
    );
  }

  addEvent(event_type, event_properties = {}) {
    const userId = this.store.getState().userId;
    const network = this.networkController.getNetwork();
    const networkCode = this.networkController.getNetworkCode(network);

    const user_properties = {
      browser_name: this.browser.name,
      browser_version: this.browser.version,
      browser_version_major:
        this.browser.version && this.browser.version.split('.')[0],
      environment: KEEPERWALLET_ENV,
      network: network,
      chainId: networkCode ? networkCode.charCodeAt(0) : undefined,
      extensionId: this.id,
    };

    this.events.push({
      user_id: userId,
      device_id: 'waves_keeper',
      app_version: this.version,
      platform: this.browser.os,
      language:
        (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        navigator.userLanguage,
      ip: '$remote',
      time: Date.now(),
      user_properties,
      event_properties,
      event_type,
    });
    return this.sendEvents();
  }

  sendEvents() {
    this.sended = this.sended
      .then(() => new Promise(resolve => setTimeout(resolve, 5000)))
      .then(() => {
        if (this.events.length === 0) {
          return;
        }

        const events = this.events;
        this.events = [];

        return fetch('https://api.amplitude.com/2/httpapi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
          body: JSON.stringify({
            api_key: statisticsApiKey,
            events: events,
          }),
        })
          .then(response => {
            if (response.ok) {
              return;
            }

            if (response.status === 429) {
              this.events.unshift(...events);
              this.sendEvents();
            } else {
              return response.text().then(responseText => {
                Sentry.withScope(scope => {
                  scope.setExtra('responseText', responseText);

                  Sentry.captureException(
                    new Error(
                      `Amplitude Error: ${response.status} ${response.statusText}`
                    )
                  );
                });
              });
            }
          })
          .catch(err => {
            if (
              err instanceof TypeError &&
              /Failed to fetch|NetworkError when attempting to fetch resource/i.test(
                err.message
              )
            ) {
              return;
            }

            Sentry.captureException(err);
          });
      });
  }

  /**
     Sends `eventType` at most once per `ms`.
     The last sent timestamp is stored in `store[storeKey].

     @param {string} eventType
     @param {number} [ms] in ms, by default is 1 hour
     @param {string} [storeKey] by default is `last{EventType}`
     **/
  addEventOnce(eventType, ms, storeKey) {
    ms = ms || 60 * 60 * 1000; // default 1 event per hour
    storeKey =
      storeKey ||
      'last' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
    const state = this.store.getState();
    const dateNow = new Date();
    const dateLast = state[storeKey] ? new Date(state[storeKey]) : dateNow - ms;

    if (dateNow - dateLast >= ms) {
      const partial = {};
      partial[storeKey] = dateNow.valueOf();
      this.addEvent(eventType);
      this.store.updateState(partial);
    }
  }

  sendTxEvent(message) {
    try {
      if (message.type === 'transactionPackage') {
        (message.data || []).forEach(data => {
          this.sendTxEvent({ ...message, type: 'transaction', data });
        });
      } else {
        const isDApp = message.data.type === 16;
        this.addEvent('approve', {
          type: message.data.type,
          msgType: message.type,
          origin: message.origin,
          dApp: isDApp ? message.data.data.dApp : undefined,
        });
      }
    } catch (e) {
      // ignore errors
    }
  }

  sendInstallEvent() {
    if (!this.store.getState().lastInstallKeeper) {
      this.addEvent('installKeeper');
      this.store.updateState({ lastInstallKeeper: new Date().valueOf() });
    }
  }

  sendIdleEvent() {
    // sends `idleKeeper` event once per hour until browser is running
    this.addEventOnce('idleKeeper');
    extension.alarms.create('idleEvent', {
      delayInMinutes: 1,
    });
  }

  sendOpenEvent() {
    this.addEventOnce('openKeeper');
  }
}
