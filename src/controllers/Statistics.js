import ObservableStore from "obs-store";
import { libs } from '@waves/waves-transactions';
import { statisticsApiKey } from '../../config';
import extension from 'extensionizer';
import { detect } from "../lib/detectBrowser";
import { WAVESKEEPER_ENV } from "../constants"

export class StatisticsController {

    events = [];
    sended = Promise.resolve();

    constructor(store = {}, controllers) {
        this.controllers = controllers;
        const userId = store.userId || StatisticsController.createUserId();
        this.store = new ObservableStore({ userId });
        this.version = extension.runtime.getManifest().version;
        this.id = extension.runtime.id;
        this.browser = detect()
    }

    static createUserId() {
        const date = Date.now();
        const random = Math.round(Math.random() * 1000000000);
        return libs.crypto.base58Encode(libs.crypto.sha256(libs.crypto.stringToBytes(`${date}-${random}`)));
    }

    addEvent(event_type, event_properties = {}) {
        const userId = this.store.getState().userId;
        const user_properties = {
            browser_name: this.browser.name,
            browser_version: this.browser.version,
            browser_version_major: this.browser.version && this.browser.version.split(".")[0],
            environment: WAVESKEEPER_ENV,
            network: this.controllers.network.store.getState().currentNetwork,
            extensionId: this.id,
        }

        this.events.push({
            user_id: userId,
            device_id: 'waves_keeper',
            app_version: this.version,
            platform: this.browser.os,
            language: (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage,
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
            .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
            .then(() => {
                    if (this.events.length === 0) {
                        return null;
                    }

                    const events = this.events;
                    this.events = [];

                    return fetch('https://api.amplitude.com/2/httpapi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': '*/*',
                        },
                        body: JSON.stringify({
                            api_key: statisticsApiKey,
                            events: events,
                        }),
                    });
                }, () => {});
    }

    transaction(message) {
        try {
            if (message.type === 'transactionPackage') {
                (message.data || []).forEach(data => {
                    this.transaction({ ...message, type: 'transaction', data });
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

        }

    }
    /**
     * Popup show event. Send no more once per hour.
     */
    showPopup() {
        const timeDelta = 1000 * 60 * 60  // 1 event per hour
        const state = this.store.getState()
        const dateNow = new Date();
        const dateLastOpened = !!state.lastOpened ? new Date(state.lastOpened) : dateNow - timeDelta;

        if (!state.lastOpened) {
            this.addEvent('installKeeper');
        }

        if ((dateNow - dateLastOpened) >= timeDelta) {
            this.store.updateState({lastOpened: dateNow});
            this.addEvent('openKeeper');
        }
    }
}
