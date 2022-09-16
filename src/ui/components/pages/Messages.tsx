import { Money } from '@waves/data-entities';
import { AssetDetail } from 'assets/types';
import { BalancesItem } from 'balances/types';
import { MessageStoreItem } from 'messages/types';
import { PreferencesAccount } from 'preferences/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { TransactionStatusState } from 'ui/reducers/updateState';
import { AppState } from 'ui/store';
import { approve, reject, rejectForever } from '../../actions/messages';
import { clearMessagesStatus } from '../../actions/localState';
import { getAsset } from '../../actions/assets';
import { WithNavigate, withNavigate } from '../../router';
import { setAutoOrigin } from '../../actions/permissions';
import { setShowNotification } from '../../actions/notifications';
import { PAGES } from '../../pageConfig';
import { getConfigByTransaction } from '../transactions';
import { FinalTransaction } from '../transactions/FinalTransaction/FinalTransaction';
import { LoadingScreen } from './loadingScreen';
import { MessageConfig } from '../transactions/types';
import { NotificationsStoreItem } from 'notifications/types';
import Background from 'ui/services/Background';

interface StateProps {
  activeMessage: MessageStoreItem | null;
  assets: Record<string, AssetDetail>;
  autoClickProtection?: boolean;
  balance: BalancesItem | undefined;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
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
  getAsset,
  reject,
  rejectForever,
  setAutoOrigin,
  setShowNotification,
};

interface DispatchProps {
  approve: (id: string) => void;
  clearMessagesStatus: (perform: boolean) => void;
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

type Props = StateProps & DispatchProps & WithNavigate;

interface State {
  activeMessage: MessageStoreItem;
  approvePending: boolean;
  assets: Record<string, AssetDetail>;
  config: MessageConfig;
  loading: boolean;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
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

  componentDidCatch() {
    this.props.reject(this.state.activeMessage.id);
  }

  render() {
    const {
      approve,
      autoClickProtection,
      clearMessagesStatus,
      messages,
      navigate,
      notifications,
      reject,
      rejectForever,
      setAutoOrigin,
      setShowNotification,
    } = this.props;

    if (this.state.loading || this.state.approvePending) {
      return <LoadingScreen />;
    }

    const { approveOk, approveError, rejectOk } = this.state.transactionStatus;

    if (approveOk || approveError || rejectOk) {
      return (
        <FinalTransaction
          selectedAccount={this.props.selectedAccount}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          message={this.props.activeMessage!}
          assets={this.props.assets}
          messages={messages}
          notifications={notifications}
          transactionStatus={this.state.transactionStatus}
          config={this.state.config}
          onClose={() => {
            clearMessagesStatus(false);
            navigate(PAGES.ASSETS);
            this.hasApproved = false;
            Background.closeNotificationWindow();
          }}
          onNext={() => {
            clearMessagesStatus(false);
            this.hasApproved = false;
          }}
          onList={() => {
            clearMessagesStatus(true);
            this.hasApproved = false;
          }}
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
        autoClickProtection={autoClickProtection}
        pending={approvePending}
        txHash={txHash}
        assets={assets}
        message={activeMessage}
        selectedAccount={selectedAccount}
        reject={event => {
          event.preventDefault();
          reject(this.state.activeMessage.id);
        }}
        rejectForever={event => {
          event.preventDefault();
          rejectForever(this.state.activeMessage.id);
        }}
        approve={(event, params) => {
          event?.preventDefault();

          if (this.hasApproved) {
            return;
          }

          if (params) {
            const { notifyPermissions, approvePermissions } = params;

            if (approvePermissions) {
              setAutoOrigin(approvePermissions);
            }

            if (notifyPermissions) {
              setShowNotification(notifyPermissions);
            }
          }

          this.hasApproved = true;
          approve(this.state.activeMessage.id);
        }}
        selectAccount={() => {
          navigate(PAGES.CHANGE_TX_ACCOUNT);
        }}
      />
    );
  }
}

export const Messages = connect(
  mapStateToProps,
  actions
)(withNavigate(MessagesComponent));
