import { setUser } from '@sentry/browser';
import { detect } from 'detect-browser';
import { nanoid } from 'nanoid';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import type { Message, MessageTx } from '../messages/types';
import type { NetworkName } from '../networks/types';
import type { ExtensionStorage } from '../storage/storage';
import type { SwapVendor } from '../swap/constants';
import type { WalletTypes } from '../ui/services/Background';
import type { NetworkController } from './network';

const {
  name: BROWSER_NAME,
  os: PLATFORM,
  version: BROWSER_VERSION,
} = detect() ?? {};

const BROWSER_VERSION_MAJOR = BROWSER_VERSION?.split('.')[0];
const KEEPER_VERSION = Browser.runtime.getManifest().version;

export type AnalyticsEvent =
  | { eventType: 'installKeeper' }
  | { eventType: 'idleKeeper' }
  | { eventType: 'openKeeper' }
  | { eventType: 'initVault' }
  | {
      eventType: 'addWallet';
      type: WalletTypes;
    }
  | {
      eventType: 'allowOrigin';
      origin: string;
    }
  | {
      eventType: 'disableOrigin';
      origin: string;
    }
  | {
      eventType: 'approve';
      origin: string | undefined;
      msgType: Message['type'];
      type?: MessageTx['type'];
      dApp?: string;
    }
  | {
      eventType: 'swapAssets';
      actualAmountCoins?: string;
      expectedAmountCoins?: string;
      expectedActualDelta?: string;
      fromAssetId: string;
      fromCoins: string;
      minReceivedCoins: string;
      slippageTolerance: number;
      status: 'success' | 'lessThanExpected';
      toAssetId: string;
      toCoins: string;
      vendor: SwapVendor;
    };

interface AmplitudeEvent {
  app_version: string;
  chainId: number;
  event_properties: Record<string, unknown>;
  event_type: string;
  insert_id: string;
  ip: string;
  language: string;
  network: NetworkName;
  platform: string | null | undefined;
  time: number;
  user_id: string;
  user_properties: {
    browser_name: string | undefined;
    browser_version: string | null | undefined;
    browser_version_major: string | undefined;
  };
}

interface MixPanelEvent {
  event: string;
  properties: {
    $browser: string | undefined;
    $browser_version: string | undefined;
    $insert_id: string;
    $os: string | null | undefined;
    $user_id: string;
    chainId: number;
    distinct_id: string;
    network: NetworkName;
    time: number;
    token: string;
    version: string;
  };
}

export class StatisticsController {
  #amplitudeEventQueue: AmplitudeEvent[] = [];
  #mixPanelEventQueue: MixPanelEvent[] = [];
  #networkController;
  #store;

  constructor({
    extensionStorage,
    networkController,
  }: {
    extensionStorage: ExtensionStorage;
    networkController: NetworkController;
  }) {
    const initState = extensionStorage.getInitState({
      lastIdleKeeper: undefined,
      lastOpenKeeper: undefined,
      userId: undefined,
    });

    const userId = initState.userId || nanoid();
    setUser({ id: userId });
    this.#store = new ObservableStore({ ...initState, userId });
    extensionStorage.subscribe(this.#store);

    this.#networkController = networkController;

    this.track({ eventType: 'idleKeeper' });

    Browser.alarms.create('idleEvent', {
      periodInMinutes: 1,
    });

    Browser.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'idleEvent':
          this.track({ eventType: 'idleKeeper' });
          break;
        case 'drainEventQueues':
          this.#drainAmplitudeEventQueue();
          this.#drainMixPanelEventQueue();
          break;
      }
    });
  }

  async #scheduleDrainEventQueues() {
    const existingAlarm = await Browser.alarms.get('drainEventQueues');

    if (!existingAlarm) {
      Browser.alarms.create('drainEventQueues', {
        delayInMinutes: 10 / 60,
      });
    }
  }

  async #drainAmplitudeEventQueue() {
    const events = this.#amplitudeEventQueue.splice(0);

    if (!__AMPLITUDE_API_KEY__) {
      return;
    }

    const response = await fetch('https://api2.amplitude.com/2/httpapi', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        api_key: __AMPLITUDE_API_KEY__,
        events,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        // Dealing with limits
        // See https://www.docs.developers.amplitude.com/analytics/apis/batch-event-upload-api/#responses
        this.#amplitudeEventQueue.unshift(...events);
        this.#scheduleDrainEventQueues();
      } else {
        const text = await response.text();

        throw new Error(
          `Amplitude Error (${response.status} ${response.statusText}): ${text}`
        );
      }
    }
  }

  async #drainMixPanelEventQueue() {
    const events = this.#mixPanelEventQueue.splice(0);

    const response = await fetch('https://api-js.mixpanel.com/track/?ip=1', {
      method: 'POST',
      body: new URLSearchParams({
        data: JSON.stringify(events),
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        // Dealing with limits
        // See https://developer.mixpanel.com/reference/track-event#limits
        this.#mixPanelEventQueue.unshift(...events);
        this.#scheduleDrainEventQueues();
      } else {
        const text = await response.text();

        throw new Error(
          `MixPanel Error (${response.status} ${response.statusText}): ${text}`
        );
      }
    }
  }

  track({ eventType, ...eventProperties }: AnalyticsEvent) {
    const state = this.#store.getState();
    const chainId = this.#networkController.getNetworkCode().charCodeAt(0);
    const network = this.#networkController.getNetwork();
    const time = Date.now();

    const track = () => {
      this.#amplitudeEventQueue.push({
        app_version: KEEPER_VERSION,
        chainId,
        event_properties: eventProperties,
        event_type: eventType,
        insert_id: nanoid(),
        ip: '$remote',
        language: navigator.language,
        network,
        platform: PLATFORM,
        time,
        user_id: state.userId,
        user_properties: {
          browser_name: BROWSER_NAME,
          browser_version: BROWSER_VERSION,
          browser_version_major: BROWSER_VERSION_MAJOR,
        },
      });

      if (__MIXPANEL_TOKEN__) {
        this.#mixPanelEventQueue.push({
          event: eventType,
          properties: {
            $browser: BROWSER_NAME,
            $browser_version: BROWSER_VERSION_MAJOR,
            $insert_id: nanoid(),
            $os: PLATFORM,
            $user_id: state.userId,
            chainId,
            distinct_id: state.userId,
            network,
            time,
            token: __MIXPANEL_TOKEN__,
            version: KEEPER_VERSION,
            ...eventProperties,
          },
        });
      }

      this.#scheduleDrainEventQueues();
    };

    if (eventType === 'idleKeeper' || eventType === 'openKeeper') {
      const stateKey = (
        {
          idleKeeper: 'lastIdleKeeper',
          openKeeper: 'lastOpenKeeper',
        } as const
      )[eventType];

      const lastTrackedMs = state[stateKey];
      const now = Date.now();

      if (lastTrackedMs == null || now >= lastTrackedMs + 12 * 60 * 60 * 1000) {
        track();
        this.#store.updateState({ ...state, [stateKey]: now });
      }
    } else {
      track();
    }
  }
}
