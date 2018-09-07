import ObservableStore from 'obs-store';
import {BigNumber} from '@waves/data-entities';
// import {moneylikeToMoney} from '../lib/moneyUtil';
//
// import * as SG from "@waves/signature-generator"
import create from 'parse-json-bignumber';
const {stringify, parse} = create({BigNumber});

import { NETWORKS, NETWORK_CONFIG } from '../constants';

const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;


export class NetworkController {
    constructor(options = {}){
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet'
        };
        this.store =  new ObservableStore(Object.assign({}, defaults, options.initState))
    }

    getNetworks() {
        return NETWORKS.map(name => ({ name, code: NETWORK_CONFIG[name].code }));
    }

    setNetwork(network){
        this.store.updateState({currentNetwork:network})
    }

    getNetwork(){
        return this.store.getState().currentNetwork
    }

    async broadcast(tx){
        const resp =  await fetch(`${NETWORK_CONFIG[this.getNetwork()].server}transactions/broadcast`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: stringify(tx)
        })
        const data = await resp.json();
        return data
    }
}

