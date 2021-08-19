import ObservableStore from "obs-store";
import { libs } from '@waves/waves-transactions';
import { statisticsApiKey } from '../../config';
import extension from 'extensionizer';
import { detect } from "../lib/detectBrowser";


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
        this.addEvent('runKeeper');
    }

    static createUserId() {
        const date = Date.now();
        const random = Math.round(Math.random() * 1000000000);
        return libs.crypto.base58Encode(libs.crypto.sha256(libs.crypto.stringToBytes(`${date}-${random}`)));
    }

    addEvent(event_type, event_properties = {}) {
        const userId = this.store.getState().userId;

        event_properties = {
            ...event_properties,
            network: this.controllers.network.store.getState().currentNetwork,
            extensionId: this.id,
        };

        this.events.push({
            user_id: userId,
            device_id: 'waves_keeper',
            app_version: this.version,
            platform: this.browser.os,
            os_name: this.browser.name,
            os_version: this.browser.version,
            language: (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage,
            time: Date.now(),
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
}
