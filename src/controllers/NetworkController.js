import ObservableStore from 'obs-store';
import {BigNumber} from '@waves/data-entities';
// import {moneylikeToMoney} from '../lib/moneyUtil';
//
// import * as SG from "@waves/signature-generator"
import create from 'parse-json-bignumber';
const {stringify, parse} = create({BigNumber});


const WAVESKEEPER_DEBUG = process.env.WAVESKEEPER_DEBUG;

const BASE_URL_MAP = {
    testnet: 'https://testnet1.wavesnodes.com/',
    mainnet: 'https://nodes.wavesplatform.com/'
}

export class NetworkController {
    constructor(options = {}){
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet'
        };
        this.store =  new ObservableStore(Object.assign({}, defaults, options.initState))
    }

    setNetwork(network){
        this.store.updateState({currentNetwork:network})
    }

    getNetwork(){
        return this.store.getState().currentNetwork
    }

    async broadcast(tx){
        const resp =  await fetch(`${BASE_URL_MAP[this.getNetwork()]}transactions/broadcast`, {
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

