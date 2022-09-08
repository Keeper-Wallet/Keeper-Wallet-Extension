import { Money } from '@waves/data-entities';
import { AssetDetail } from 'assets/types';
import { BalancesItem } from 'balances/types';
import { MessageStoreItem } from 'messages/types';
import { PreferencesAccount } from 'preferences/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { TransactionStatusState } from 'ui/reducers/updateState';
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
import { PageComponentProps, PAGES } from '../../pageConfig';
import { getConfigByTransaction } from '../transactions';
import { FinalTransaction } from '../transactions/FinalTransaction/FinalTransaction';
import { Intro } from './Intro';
import { MessageComponentProps, MessageConfig } from '../transactions/types';

interface StateProps {
  activeMessage: MessageStoreItem | null;
  assets: Record<string, AssetDetail>;
  autoClickProtection?: boolean;
  balance: BalancesItem | undefined;
  messages: MessageStoreItem[];
  notifications: unknown[];
  selectedAccount: Partial<PreferencesAccount>;
  transactionStatus: TransactionStatusState;
}

const mapStateToProps = function (state: AppState): StateProps {
  return {
    activeMessage: state.activePopup && state.activePopup.msg,
    assets: state.assets,
    autoClickProtection: state.uiState && state.uiState.autoClickProtection,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    balance: state.balances[state.selectedAccount.address!],
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
  setAutoOrigin: (permissions: {
    origin: string | undefined;
    params: Partial<{
      type: 'allowAutoSign';
      totalAmount: string | null;
      interval: number | null;
      approved?: unknown[];
    }>;
  }) => void;
  setShowNotification: (options: {
    origin: string | undefined;
    canUse: boolean;
  }) => void;
}

type Props = PageComponentProps & StateProps & DispatchProps;

interface State {
  activeMessage: MessageStoreItem;
  approvePending: boolean;
  assets: Record<string, AssetDetail>;
  config: MessageConfig;
  loading: boolean;
  messages: MessageStoreItem[];
  notifications: unknown[];
  selectedAccount: Partial<PreferencesAccount>;
  transactionStatus: TransactionStatusState;
  txHash: string | string[];
}

class MessagesComponent extends React.Component<Props, State> {
  readonly state = {} as State;
  hasApproved: boolean | undefined;

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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sourceSignData = activeMessage!.data || {};
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const txHash = activeMessage!.messageHash;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const config = getConfigByTransaction(activeMessage!);
    return {
      transactionStatus,
      selectedAccount,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      activeMessage: activeMessage!,
      config,
      txHash,
      assets,
      messages,
      notifications,
      loading,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getAssetsAndMoneys(data: any) {
    const moneys: Array<{ path: unknown }> = [];
    const assets: Record<string, true> = {};

    const work: Array<{
      path: unknown[];
      data: { amountAsset?: string; assetId?: string; priceAsset?: string };
    }> = [];

    if (data && typeof data === 'object') {
      work.push({ path: [], data });
    }

    while (work.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { path: currentPath, data: currentData } = work.pop()!;

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

  rejectHandler = (e: unknown) => this.reject(e);

  rejectForeverHandler = (e: unknown) => this.rejectForever(e);

  approveHandler: MessageComponentProps['approve'] = (e, params) =>
    this.approve(e, params);

  closeHandler = (e: unknown) => {
    this.updateActiveMessages(e);
    this.props.closeNotificationWindow();
  };

  toListHandler = (e: unknown) => this.updateActiveMessages(e);

  nextHandler = (e: unknown) => this.updateActiveMessages(e, true);

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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          message={this.props.activeMessage!}
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

  approve(
    e: Parameters<MessageComponentProps['approve']>[0],
    params: Parameters<MessageComponentProps['approve']>[1]
  ) {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.props.approve(this.state.activeMessage.id!);
  }

  reject(e: unknown = null) {
    if (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).preventDefault();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.props.reject(this.state.activeMessage.id!);
  }

  rejectForever(e: unknown = null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (e) (e as any).preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.props.rejectForever(this.state.activeMessage.id!);
  }

  updateActiveMessages(e: unknown, isNext = false) {
    if (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).stopPropagation();
    }

    this.props.clearMessagesStatus(!isNext);
    this.props.setTab(PAGES.ROOT);
    this.hasApproved = false;
  }
}

export const Messages = connect(mapStateToProps, actions)(MessagesComponent);
