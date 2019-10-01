import ObservableStore from "obs-store";
import { libs } from '@waves/waves-transactions';
import { statisticsApiKey } from '../../config';
import extension from 'extensionizer';
const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';

export class StatisticsController {

    constructor(store = {}, controllers) {
        this.controllers = controllers;
        const userId = store.userId || StatisticsController.createUserId();
        this.store = new ObservableStore({ userId });
        this.version = extension.runtime.getManifest().version;
        this.id = extension.runtime.id;
        this.addEvent('runKeeper');
    }

    addEvent(event_type, event_properties = {}) {
        const userId = this.store.getState().userId;

        event_properties = {
            ...event_properties,
            network: this.controllers.network.store.getState().currentNetwork,
            app_version: this.version,
            extensionId: this.id,
        };

        if (!WAVESKEEPER_DEBUG) {
            return null;
        }

        return fetch('https://api.amplitude.com/2/httpapi', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Accept':'*/*',
            },
            body: JSON.stringify({
                api_key: statisticsApiKey,
                events: [
                    {
                        user_id: userId,
                        device_id: 'waves_keeper',
                        time: Date.now(),
                        event_properties,
                        event_type,
                    }
                ]
            }),
        });
    }

    static createUserId() {
        const date = Date.now();
        const random = Math.round(Math.random() * 1000000000);
        return libs.crypto.base58Encode(libs.crypto.sha256(libs.crypto.stringToBytes(`${date}-${random}`)));
    }
}
