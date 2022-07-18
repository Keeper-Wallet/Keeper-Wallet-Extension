import { Money } from '@waves/data-entities';
import { Account } from 'accounts/types';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  AccountBalance,
  TransactionStatusState,
} from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import { AppState } from 'ui/store';
import {
  approve,
  clearMessagesStatus,
  closeNotificationWindow,
  getAsset,
  reject,
  rejectForever,
  setAutoOrigin,
  setShowNotification,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import {
  ComponentConfig,
  FinalTransaction,
  getConfigByTransaction,
} from '../transactions';
import { Message } from '../transactions/BaseTransaction';
import { Intro } from './Intro';

interface StateProps {
  activeMessage: Message;
  assets: Record<string, AssetDetail>;
  autoClickProtection?: boolean;
  balance: AccountBalance;
  messages: Message[];
  notifications: unknown[];
  selectedAccount: Account;
  transactionStatus: TransactionStatusState;
}

const mapStateToProps = function (state: AppState): StateProps {
  return {
    activeMessage: state.activePopup && state.activePopup.msg,
    assets: state.assets,
    autoClickProtection: state.uiState && state.uiState.autoClickProtection,
    balance: state.balances[state.selectedAccount.address],
    messages: state.messages,
    notifications: state.notifications,
    selectedAccount: state.selectedAccount,
    transactionStatus: state.localState.transactionStatus,
  };
};

const actions = {
  approve,
  clearMessagesStatus,
  closeNotificationWindow,
  getAsset,
  reject,
  rejectForever,
  setAutoOrigin,
  setShowNotification,
};

interface DispatchProps {
  approve: (id: string) => void;
  clearMessagesStatus: (perform: boolean) => void;
  closeNotificationWindow: () => void;
  getAsset: (assetId: string) => void;
  reject: (id: string) => void;
  rejectForever: (id: string) => void;
  setAutoOrigin: (permissions: unknown) => void;
  setShowNotification: (permissions: unknown) => void;
}

interface OwnProps {
  setTab: (tab: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  activeMessage: Message;
  approvePending: boolean;
  assets: Record<string, AssetDetail>;
  config: ComponentConfig;
  loading: boolean;
  messages: Message[];
  notifications: unknown[];
  selectedAccount: Account;
  transactionStatus: TransactionStatusState;
  txHash: string;
}

class MessagesComponent extends React.Component<Props, State> {
  readonly state = {} as State;
  hasApproved: boolean;

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const {
      balance,
      selectedAccount,
      assets,
      activeMessage,
      messages,
      notifications,
    } = nextProps;
    let loading = true;

    if (!assets || !assets['WAVES'] || !balance) {
      nextProps.getAsset('WAVES');
      return { loading: true, selectedAccount };
    }

    const { transactionStatus } = nextProps;
    const isExistMsg =
      activeMessage &&
      prevState.activeMessage &&
      activeMessage.id === prevState.activeMessage.id;

    if (isExistMsg) {
      loading = false;
      return {
        assets,
        loading,
        messages,
        notifications,
        selectedAccount,
        transactionStatus,
      };
    }

    const sourceSignData = activeMessage.data || {};
    const parsedData = MessagesComponent.getAssetsAndMoneys(sourceSignData);

    const needGetAssets = new Set(
      Object.keys(parsedData.assets).filter(id => !assets[id])
    );

    const nextAssetId = needGetAssets.values().next().value;
    if (nextAssetId) {
      nextProps.getAsset(nextAssetId);
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

  componentDidCatch() {
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

    const { activeMessage, assets, approvePending, txHash, selectedAccount } =
      this.state;
    const conf = getConfigByTransaction(activeMessage);
    const { message: Component, type } = conf;

    return (
      <Component
        txType={type}
        autoClickProtection={this.props.autoClickProtection}
        pending={approvePending}
        txHash={txHash}
        assets={assets}
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
    e?.preventDefault();

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

export const Messages = connect(mapStateToProps, actions)(MessagesComponent);
