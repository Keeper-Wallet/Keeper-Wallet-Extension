import {getAdapterByType} from '@waves/signature-adapter'
import {BigNumber} from '@waves/data-entities';
// import {moneylikeToMoney} from '../lib/moneyUtil';
//
// import * as SG from "@waves/signature-generator"
import create from 'parse-json-bignumber';
const {stringify, parse} = create({BigNumber});


export class Wallet {
    constructor(user) {
        if (!user) throw new Error('user required')
        this.user = user
    }

    getAccount() {
        let account = Object.assign({}, this.user)
        delete account['id'];
        delete account['seed'];
        return account;
    }

    serialize() {
        return this.user
    }

    getSecret() {
        return this.user.seed
    }

    async sign(tx){
        const Adapter = getAdapterByType(this.user.type);

        Adapter.initOptions({networkCode: this.user.networkCode});
        //Todo: temporary for seed
        let params = this.user
        if (this.user.type === 'seed'){
            params = this.user.seed
        }
        const adapter = new Adapter(params);
        const signable = adapter.makeSignable(tx);
        const dataWithBignumbers = await signable.getDataForApi();
        const dataWithoutBignumbers = Object.entries(dataWithBignumbers).reduce((acc, [key, value]) => {
            if (value instanceof BigNumber) {
                acc[key] = value.toString()
            }else {
                acc[key] = value
            }
            return acc
        }, {})
        return dataWithoutBignumbers
    }
}