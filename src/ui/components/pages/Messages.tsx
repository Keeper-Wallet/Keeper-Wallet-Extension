import * as React from 'react';
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import { getAsset } from '../../actions';
import { Asset, Money } from '@waves/data-entities';
import { Intro } from './Intro';
import { getConfigByTransaction } from '../transactions';

@translate('extension')
class MessagesComponent extends React.Component {

    readonly state;
    readonly props;
    rejectHandler = () => {};
    approveHandler = () => {};
    

    render() {
        if (this.state.loading) {
            return <Intro></Intro>
        }

        const signData = this.state.signData;
        const conf = getConfigByTransaction(signData);
        const { component: Component, type } = conf;

        return <Component txType={type}
                          signData={signData}
                          selectedAccount={this.state.selectedAccount}
                          reject={this.rejectHandler}
                          approve={this.approveHandler}>
        </Component>;
    }

    static getDerivedStateFromProps(props, state) {

        const { balance: sourceBalance, selectedAccount, assets, messages } = props;

        if (!assets || !assets['WAVES']) {
            props.getAsset('WAVES');
            return { loading: true, selectedAccount } ;
        }

        const assetInstance = new Asset(assets['WAVES']);
        const currentId = state && state.message && state.message.id;
        const isExistMsg = !!messages.find(({ id }) => id === currentId);
        const balance = new Money(sourceBalance || 0, assetInstance);

        if (currentId && isExistMsg) {
            return { ...state, balance, selectedAccount, assets};
        }
        const message = props.messages[0];
        const sourceSignData = message.tx;
        const parsedData = MessagesComponent.getAssetsAndMoneys(sourceSignData);
        const needGetAssets = Object.keys(parsedData.assets).filter(id => !assets[id]);
        needGetAssets.forEach( id => props.getAsset(id));

        if (needGetAssets.length) {
            return { loading: true, selectedAccount } ;
        }

        const signData = MessagesComponent.fillSignData(sourceSignData, parsedData.moneys, assets);
        return { message, signData, balance, selectedAccount, assets, loading: false };
    }

    static getAssetsAndMoneys(data) {
        const moneys = [];
        const assets = {};
        const work = [];

        if (data && typeof data === 'object') {
            work.push({ path: [], data });
        }

        while (work.length) {
            const { path: currentPath, data: currentData} = work.pop();

            if (typeof currentData !== 'object') {
                continue;
            }

            if ( 'assetId' in currentData) {
                assets[currentData.assetId] = true;

                if ('tokens' in currentData ) {
                    moneys.push({ ...currentData, path: currentPath });
                    continue;
                }
            }

            for (const [key, data] of Object.entries(currentData)) {
                const path = [...currentPath, key];
                if (typeof data === 'object') {
                    work.push({ data, path });
                }
            }
            
        }

        return { assets, moneys };
    }

    static fillSignData(data, moneys, assets) {
        const result = { ...data };

        for (const { path, ...money } of moneys) {

            let obj = result;
            const moneyInstance = new Money(money.tokens, new Asset(assets[money.assetId]));
            const key = path.pop();

            for (const key of path) {
                 obj[key] = { ...obj[key] };
                 obj = obj[key];
            }

            obj[key] = moneyInstance;
        }

        return result;
    }
}

const mapStateToProps = function (store) {
    return {
        selectedAccount: store.selectedAccount,
        balance: store.balances[store.selectedAccount.address],
        messages: store.messages,
        assets: store.assets
    };
};

const actions = {
    getAsset
};

export const Messages = connect(mapStateToProps, actions)(MessagesComponent);
