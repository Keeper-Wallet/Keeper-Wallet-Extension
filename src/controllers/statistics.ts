import { captureException, setUser, withScope } from '@sentry/react';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { libs } from '@waves/waves-transactions';
import { MessageStoreItem } from 'messages/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { detect } from '../lib/detectBrowser';
import { ExtensionStorage } from '../storage/storage';
import { NetworkController } from './network';

interface StatistictsEvent {
  user_id: unknown;
  app_version: unknown;
  platform: unknown;
  language: unknown;
  ip: unknown;
  time: number;
  user_properties: unknown;
  event_properties: unknown;
  event_type: unknown;
}

export class StatisticsController {
  private events: StatistictsEvent[] = [];
  private sended = Promise.resolve();
  _idle = 0;

  private store;
  private networkController;
  private version;
  private id;

  private browser;

  constructor({
    extensionStorage,
    networkController,
  }: {
    extensionStorage: ExtensionStorage;
    networkController: NetworkController;
  }) {
    const initState = extensionStorage.getInitState({
      lastIdleKeeper: undefined,
      lastInstallKeeper: undefined,
      lastOpenKeeper: undefined,
      userId: undefined,
    });

    const userId = initState.userId || StatisticsController.createUserId();
    setUser({ id: userId });
    this.store = new ObservableStore({ ...initState, userId });
    extensionStorage.subscribe(this.store);

    this.networkController = networkController;
    this.version = Browser.runtime.getManifest().version;
    this.id = Browser.runtime.id;
    this.browser = detect();
    this.sendInstallEvent();
    this.sendIdleEvent();

    Browser.alarms.onAlarm.addListener(({ name }) => {
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

  addEvent(event_type: string, event_properties = {}) {
    const userId = this.store.getState().userId;
    const network = this.networkController.getNetwork();
    const networkCode = this.networkController.getNetworkCode(network);

    const user_properties = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      browser_name: this.browser!.name,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      browser_version: this.browser!.version,
      browser_version_major:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.browser!.version && this.browser!.version.split('.')[0],
      environment: process.env.NODE_ENV,
      network,
      chainId: networkCode ? networkCode.charCodeAt(0) : undefined,
      extensionId: this.id,
    };

    this.events.push({
      user_id: userId,
      app_version: this.version,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      platform: this.browser!.os,
      language:
        (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).userLanguage,
      ip: '$remote',
      time: Date.now(),
      user_properties,
      event_properties,
      event_type,
    });
    return this.sendEvents();
  }

  sendEvents(delay = 5000) {
    if (!__AMPLITUDE_API_KEY__) {
      return;
    }

    this.sended = this.sended
      .then(() => new Promise(resolve => setTimeout(resolve, delay)))
      .then(() => {
        if (this.events.length === 0) {
          return;
        }

        const events = this.events;
        this.events = [];

        return fetch('https://api2.amplitude.com/2/httpapi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
          body: JSON.stringify({
            api_key: __AMPLITUDE_API_KEY__,
            events,
          }),
        })
          .then(response => {
            if (response.ok) {
              return;
            }

            if (response.status === 429) {
              this.events.unshift(...events);
              this.sendEvents(30000);
            } else {
              return response.text().then(responseText => {
                if (/Blocked by AdGuard/i.test(responseText)) {
                  return;
                }

                if (response.status !== 400) {
                  return;
                }

                withScope(scope => {
                  scope.setExtra('responseText', responseText);

                  captureException(
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

            captureException(err);
          });
      });
  }

  addEventOnce(eventType: string, ms?: number, storeKey?: string) {
    ms = ms || 60 * 60 * 1000; // default 1 event per hour
    storeKey =
      storeKey ||
      `last${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
    const state = this.store.getState();
    const dateNow = new Date().getTime();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateLast = (state as any)[storeKey]
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Date((state as any)[storeKey]).getTime()
      : dateNow - ms;

    if (dateNow - dateLast >= ms) {
      const partial: Record<string, number> = {};
      partial[storeKey] = dateNow.valueOf();
      this.addEvent(eventType);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.store.updateState(partial as any);
    }
  }

  sendTxEvent(message: MessageStoreItem) {
    try {
      if (message.type === 'transactionPackage') {
        (message.data || []).forEach(data => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.sendTxEvent({ ...message, type: 'transaction', data } as any);
        });
      } else {
        this.addEvent('approve', {
          type: message.data.type,
          msgType: message.type,
          origin: message.origin,
          dApp:
            message.data.type === TRANSACTION_TYPE.INVOKE_SCRIPT
              ? message.data.data.dApp
              : undefined,
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

    Browser.alarms.create('idleEvent', {
      delayInMinutes: 1,
    });
  }

  sendOpenEvent() {
    this.addEventOnce('openKeeper');
  }
}
