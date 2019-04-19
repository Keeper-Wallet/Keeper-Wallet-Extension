import * as React from 'react';
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import { updateActiveMessage, getAsset, approve, reject, clearMessagesStatus, clearMessages, closeNotificationWindow, setAutoOrigin, setShowNotification } from '../../actions';
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
    approveHandler = (e, params) => this.approve(e, params);
    closeHandler = (e) => {
        this.updateActiveMessages(e);
        this.props.closeNotificationWindow();
    };
    toListHandler = (e) => this.updateActiveMessages(e);
    nextHandler = (e) => this.updateActiveMessages(e, true);
    selectAccountHandler = () => this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);
    
    componentDidCatch(error, info) {
        this.reject();
    }
    
    render() {
        if (this.state.loading || this.state.approvePending) {
            return <Intro/>
        }
        
        const {
            approveOk,
            approveError,
            rejectOk
        } = this.state.transactionStatus;
    
        if (approveOk || approveError || rejectOk) {
            return <FinalTransaction selectedAccount={this.props.selectedAccount}
                                     message={this.props.activeMessage}
                                     assets={this.props.assets}
                                     messages={this.props.messages}
                                     notifications={this.props.notifications}
                                     transactionStatus={this.state.transactionStatus}
                                     config={this.state.config}
                                     onClose={this.closeHandler}
                                     onNext={this.nextHandler}
                                     onList={this.toListHandler}/>
        }
        
        const { activeMessage } = this.state;
        const conf = getConfigByTransaction(activeMessage);
        const { message: Component, type } = conf;

        return <Component txType={type}
                          autoClickProtection={this.props.autoClickProtection}
                          pending={this.state.approvePending}
                          txHash={this.state.txHash}
                          assets={this.state.assets}
                          message={activeMessage}
                          selectedAccount={this.state.selectedAccount}
                          onClose={this.closeHandler}
                          onNext={this.nextHandler}
                          onList={this.toListHandler}
                          reject={this.rejectHandler}
                          approve={this.approveHandler}
                          selectAccount={this.selectAccountHandler}>
        </Component>;
    }

    approve(e, params?) {
        e.preventDefault();
        
        if (this.hasApproved) {
            return;
        }
        
        if (params) {
            const { notifyPermissions, approvePermissions } = params;
            
            if (approvePermissions) {
                this.props.setAutoOrigin(approvePermissions);
            }
            
            if (notifyPermissions) {
                this.props.setShowNotification(notifyPermissions);
            }
        }
        
        this.hasApproved = true;
        this.props.approve(this.state.activeMessage.id);
    }
    
    reject(e = null) {
        if (e) {
            e.preventDefault();
        }
        this.props.reject(this.state.activeMessage.id);
    }
    
    updateActiveMessages( e, isNext = false) {
    
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        this.props.clearMessagesStatus(!isNext);
        this.props.setTab(PAGES.ROOT);
        this.hasApproved = false;
    }
    
    static getDerivedStateFromProps(props, state) {

        const { balance: sourceBalance, selectedAccount, assets, activeMessage, messages, notifications } = props;
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
            const balance = Money.fromTokens(sourceBalance || 0, assetInstance);
            loading = false;
            return { balance, selectedAccount, assets, transactionStatus, loading, messages, notifications };
        }
        
        const sourceSignData = activeMessage.data || {};
        const parsedData = MessagesComponent.getAssetsAndMoneys(sourceSignData);
        const needGetAssets = Object.keys(parsedData.assets).filter(id => assets[id] === undefined);
        needGetAssets.forEach( id => props.getAsset(id));
    
        if (needGetAssets.length) {
            return { loading, selectedAccount } ;
        }
        
        loading = false;
        const txHash = activeMessage.messageHash;
        const config = getConfigByTransaction(activeMessage);
        return {
            transactionStatus,
            selectedAccount,
            activeMessage,
            config,
            txHash,
            balance,
            assets,
            messages,
            notifications,
            loading,
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
}

const mapStateToProps = function (store) {
    return {
        autoClickProtection: store.uiState && store.uiState.autoClickProtection,
        transactionStatus: store.localState.transactionStatus,
        balance: store.balances[store.selectedAccount.address],
        selectedAccount: store.selectedAccount,
        activeMessage: store.activeMessage,
        assets: store.assets,
        messages: store.messages,
        notifications: store.notifications,
    };
};

const actions = {
    setShowNotification,
    closeNotificationWindow,
    clearMessagesStatus,
    updateActiveMessage,
    setAutoOrigin,
    clearMessages,
    getAsset,
    approve,
    reject,
};

export const Messages = connect(mapStateToProps, actions)(MessagesComponent);
