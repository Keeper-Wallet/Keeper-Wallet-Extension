import * as React from 'react';
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import { updateActiveMessage, getAsset, approve, reject, clearMessagesStatus, clearMessages, closeNotificationWindow } from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Intro } from './Intro';
import { getConfigByTransaction, FinalTransaction } from '../transactions';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class MessagesComponent extends React.Component {

    readonly state = {} as any;
    readonly props;
    hasApproved: boolean;
    rejectHandler = (e) => this.reject(e);
    approveHandler = (e) => this.approve(e);
    clearMessagesHandler = () => this.clearMessages();
    clearMessageStatusHandler = () => this.cleanMessageStatus();
    clearMessageStatusHandlerNoClose = () => this.cleanMessageStatus(true);
    selectAccountHandler = () => this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);

    render() {
        if (this.state.loading) {
            return <Intro/>
        }
        
        const {
            approveOk,
            approveError,
            rejectOk
        } = this.state.transactionStatus;
    
        if (approveOk || approveError || rejectOk) {
            return <FinalTransaction selectedAccount={this.props.selectedAccount}
                                     hasNewMessages={this.props.hasNewMessages}
                                     transactionStatus={this.state.transactionStatus}
                                     config={this.state.config}
                                     signData={this.state.signData}
                                     onClick={this.clearMessageStatusHandler}
                                     onNext={this.clearMessageStatusHandlerNoClose}/>
        }
        
        const { activeMessage, signData } = this.state;
        const conf = getConfigByTransaction(signData);
        const { component: Component, type } = conf;

        return <Component txType={type}
                          pending={this.state.approvePending}
                          txHash={this.state.txHash}
                          signData={signData}
                          message={activeMessage}
                          selectedAccount={this.state.selectedAccount}
                          clearMessagesHandler={this.clearMessagesHandler }
                          clearMessageStatusHandler={this.clearMessageStatusHandler }
                          reject={this.rejectHandler}
                          approve={this.approveHandler}
                          selectAccount={this.selectAccountHandler}>
        </Component>;
    }

    approve(e) {
        e.preventDefault();
        
        if (this.hasApproved) {
            return;
        }
        
        this.hasApproved = true;
        this.props.approve(this.state.activeMessage.id);
    }
    
    reject(e) {
        e.preventDefault();
        this.props.reject(this.state.activeMessage.id);
    }
    
    clearMessages() {
        this.props.clearMessages();
        this.cleanMessageStatus();
    }
    
    cleanMessageStatus(noCloseWindow: boolean = true) {
        this.props.clearMessagesStatus();
        
        if (!noCloseWindow) {
            this.props.closeNotificationWindow();
        }
        
        this.props.setTab(PAGES.ROOT);
        this.hasApproved = false;
    }
    
    static getDerivedStateFromProps(props, state) {

        const { balance: sourceBalance, selectedAccount, assets, activeMessage } = props;
        let loading = true;
    
        if (!assets || !assets['WAVES']) {
            props.getAsset('WAVES');
            return { loading: true, selectedAccount } ;
        }
    
        const assetInstance = new Asset(assets['WAVES']);
        const balance = new Money(sourceBalance || 0, assetInstance);
        
        const { transactionStatus } = props;
        const isExistMsg = activeMessage && state.activeMessage && activeMessage.id === state.activeMessage.id;

        if (isExistMsg) {
            const assetInstance = new Asset(assets['WAVES']);
            const balance = Money.fromTokens(sourceBalance || 0, assetInstance);
            loading = false;
            return { ...state, balance, selectedAccount, assets, transactionStatus, loading};
        }
        
        const sourceSignData = activeMessage.data;
        const parsedData = MessagesComponent.getAssetsAndMoneys(sourceSignData);
        const needGetAssets = Object.keys(parsedData.assets).filter(id => assets[id] === undefined);
        needGetAssets.forEach( id => props.getAsset(id));

        if (needGetAssets.length) {
            return { loading, selectedAccount } ;
        }
        
        loading = true;
        const signData = MessagesComponent.fillSignData(sourceSignData, parsedData.moneys, assets);
        const txHash = activeMessage.messageHash;
        const config = getConfigByTransaction(signData);
        return {
            transactionStatus,
            activeMessage,
            signData,
            config,
            txHash,
            balance,
            selectedAccount,
            assets,
            loading
        };
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

            if (currentData == null || typeof currentData !== 'object') {
                continue;
            }

            if ( currentData instanceof Money) {
                continue;
            }
            
            if ('priceAsset' in currentData) {
                assets[currentData.priceAsset || 'WAVES'] = true;
            }
    
            if ('amountAsset' in currentData) {
                assets[currentData.amountAsset || 'WAVES'] = true;
            }
            
            if ( 'assetId' in currentData) {
                assets[currentData.assetId || 'WAVES'] = true;

                if ('tokens' in currentData ) {
                    moneys.push({ ...currentData, path: currentPath });
                    continue;
                }

                if ('coins' in currentData ) {
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

        for (const { path, assetId, tokens, coins } of moneys) {

            let obj = result;
            const asset = assets[assetId];
            let moneyInstance = null;
            if (asset) {
                moneyInstance = tokens != null ?  Money.fromTokens(tokens, new Asset(asset)) : Money.fromCoins(coins, new Asset(asset))
            }
            const key = path.pop();

            for (const key of path) {
                if (Array.isArray(obj[key])) {
                    obj[key] = [ ...obj[key] ];
                } else {
                    obj[key] = { ...obj[key] };
                }
                 obj = obj[key];
            }

            obj[key] = moneyInstance || obj[key];
        }

        return result;
    }
}

const mapStateToProps = function (store) {
    return {
        transactionStatus: store.localState.transactionStatus,
        balance: store.balances[store.selectedAccount.address],
        selectedAccount: store.selectedAccount,
        activeMessage: store.activeMessage,
        assets: store.assets,
        hasNewMessages: (store.messages
            .map(item => item.id)
            .filter(id => id !== store.activeMessage.id)
            .length > 0),
    };
};

const actions = {
    closeNotificationWindow,
    clearMessagesStatus,
    updateActiveMessage,
    clearMessages,
    getAsset,
    approve,
    reject
};

export const Messages = connect(mapStateToProps, actions)(MessagesComponent);
