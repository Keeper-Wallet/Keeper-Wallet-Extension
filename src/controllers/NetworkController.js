import ObservableStore from 'obs-store';
import {BigNumber} from '@waves/data-entities';
import create from 'parse-json-bignumber';
const {stringify, parse} = create({BigNumber});

import { NETWORKS, NETWORK_CONFIG } from '../constants';

const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;


export class NetworkController {
    constructor(options = {}){
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet',
            customNodes: {
                mainnet: null,
                testnet: null
            }
        };
        this.store =  new ObservableStore(Object.assign({}, defaults, options.initState))
    }

    getNetworks() {
        return NETWORKS.map(name => ({ ...NETWORK_CONFIG[name], name }));
    }

    setNetwork(network){
        this.store.updateState({currentNetwork:network});
    }

    getNetwork(){
        return this.store.getState().currentNetwork
    }

    setCustomNode(url, network = 'mainnet'){
        let { customNodes } = this.store.getState();
        customNodes[network] = url;
        this.store.updateState({customNodes});
    }

    getCustomNodes(){
        return this.store.getState().customNodes;
    }

    getNode(){
        const network = this.getNetwork();
        return this.getCustomNodes()[network] || NETWORK_CONFIG[this.getNetwork()].server;
    }
    async broadcast(tx){
        const API_BASE = this.getNode();
        const url = new URL('transactions/broadcast', API_BASE).toString();
        const resp =  await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: stringify(tx)
        });
        console.log(resp)
        if (resp.ok){

        }
        switch (resp.status) {
            case 200:
                return await resp.json();
            case 400:
                const error = await resp.json();
                throw new Error(error.message);
            default:
                throw new Error(await resp.text())
        }
    }
}

