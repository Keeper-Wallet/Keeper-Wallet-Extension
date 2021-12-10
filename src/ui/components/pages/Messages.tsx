import * as React from 'react';
import { connect } from 'react-redux';
import {
  approve,
  clearMessages,
  clearMessagesStatus,
  closeNotificationWindow,
  getAsset,
  reject,
  rejectForever,
  setActiveMessage,
  setAutoOrigin,
  setShowNotification,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { Money } from '@waves/data-entities';
import { Intro } from './Intro';
import { FinalTransaction, getConfigByTransaction } from '../transactions';
import { BalanceAssets } from '../transactions/BaseTransaction';
import { DEFAULT_FEE_CONFIG } from '../../../constants';

class MessagesComponent extends React.Component {
  readonly state = {} as any;
  readonly props;
  hasApproved: boolean;

  static getDerivedStateFromProps(props, state) {
    const {
      balance,
      selectedAccount,
      assets,
      activeMessage,
      messages,
      notifications,
    } = props;
    let loading = true;

    if (!assets || !assets['WAVES'] || !balance) {
      props.getAsset('WAVES');
      return { loading: true, selectedAccount };
    }

    const sponsoredBalance: BalanceAssets = Object.fromEntries(
      Object.entries({
        WAVES: {
          balance: balance.available,
          minSponsoredAssetFee:
            DEFAULT_FEE_CONFIG.calculate_fee_rules.default.fee,
          sponsorBalance: balance.available,
        },
        ...balance.assets,
      } as BalanceAssets).filter(
        ([, assetBalance]) => assetBalance.minSponsoredAssetFee != null
      )
    );

    const { transactionStatus } = props;
    const isExistMsg =
      activeMessage &&
      state.activeMessage &&
      activeMessage.id === state.activeMessage.id;

    if (isExistMsg) {
      loading = false;
      return {
        selectedAccount,
        assets,
        transactionStatus,
        loading,
        messages,
        notifications,
      };
    }

    const sourceSignData = activeMessage.data || {};
    const parsedData = MessagesComponent.getAssetsAndMoneys(sourceSignData);

    const needGetAssets = new Set(
      Object.keys(parsedData.assets).filter(
        id => !Object.keys(assets).includes(id)
      )
    );

    const nextAssetId = needGetAssets.values().next().value;
    if (nextAssetId) {
      props.getAsset(nextAssetId);
      return { loading, selectedAccount };
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
      sponsoredBalance,
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
      const { path: currentPath, data: currentData } = work.pop();

      if (currentData == null || typeof currentData !== 'object') {
        continue;
      }

      if (currentData instanceof Money) {
        continue;
      }

      if ('priceAsset' in currentData) {
        assets[currentData.priceAsset || 'WAVES'] = true;
      }

      if ('amountAsset' in currentData) {
        assets[currentData.amountAsset || 'WAVES'] = true;
      }

      if ('assetId' in currentData) {
        assets[currentData.assetId || 'WAVES'] = true;

        if ('tokens' in currentData) {
          moneys.push({ ...currentData, path: currentPath });
          continue;
        }

        if ('coins' in currentData) {
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

  rejectHandler = e => this.reject(e);

  rejectForeverHandler = e => this.rejectForever(e);

  approveHandler = (e, params) => this.approve(e, params);

  closeHandler = e => {
    this.updateActiveMessages(e);
    this.props.closeNotificationWindow();
  };

  toListHandler = e => this.updateActiveMessages(e);

  nextHandler = e => this.updateActiveMessages(e, true);

  selectAccountHandler = () => this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);

  componentDidCatch(error, info) {
    this.reject();
  }

  render() {
    if (this.state.loading || this.state.approvePending) {
      return <Intro />;
    }

    const { approveOk, approveError, rejectOk } = this.state.transactionStatus;

    if (approveOk || approveError || rejectOk) {
      return (
        <FinalTransaction
          selectedAccount={this.props.selectedAccount}
          message={this.props.activeMessage}
          assets={this.props.assets}
          messages={this.props.messages}
          notifications={this.props.notifications}
          transactionStatus={this.state.transactionStatus}
          config={this.state.config}
          onClose={this.closeHandler}
          onNext={this.nextHandler}
          onList={this.toListHandler}
        />
      );
    }

    const {
      activeMessage,
      assets,
      approvePending,
      txHash,
      sponsoredBalance,
      selectedAccount,
      autoClickProtection,
    } = this.state;
    const conf = getConfigByTransaction(activeMessage);
    const { message: Component, type } = conf;

    return (
      <Component
        txType={type}
        autoClickProtection={autoClickProtection}
        pending={approvePending}
        txHash={txHash}
        assets={assets}
        sponsoredBalance={sponsoredBalance}
        message={activeMessage}
        selectedAccount={selectedAccount}
        onClose={this.closeHandler}
        onNext={this.nextHandler}
        onList={this.toListHandler}
        reject={this.rejectHandler}
        rejectForever={this.rejectForeverHandler}
        approve={this.approveHandler}
        selectAccount={this.selectAccountHandler}
      />
    );
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

  rejectForever(e = null) {
    if (e) e.preventDefault();
    this.props.rejectForever(this.state.activeMessage.id);
  }

  updateActiveMessages(e, isNext = false) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.props.clearMessagesStatus(!isNext);
    this.props.setTab(PAGES.ROOT);
    this.hasApproved = false;
  }
}

const mapStateToProps = function (store) {
  return {
    autoClickProtection: store.uiState && store.uiState.autoClickProtection,
    transactionStatus: store.localState.transactionStatus,
    balance: store.balances[store.selectedAccount.address],
    selectedAccount: store.selectedAccount,
    activeMessage: store.activePopup && store.activePopup.msg,
    assets: store.assets,
    messages: store.messages,
    notifications: store.notifications,
  };
};

const actions = {
  setShowNotification,
  closeNotificationWindow,
  clearMessagesStatus,
  setActiveMessage,
  setAutoOrigin,
  clearMessages,
  getAsset,
  approve,
  reject,
  rejectForever,
};

export const Messages = connect(mapStateToProps, actions)(MessagesComponent);
