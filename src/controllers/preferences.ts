import { addBreadcrumb } from '@sentry/browser';
import EventEmitter from 'events';
import { NetworkProfile } from 'networks/types';
import ObservableStore from 'obs-store';
import {
  normalizeOldWavesAccount,
  type OldWavesAccount,
} from 'preferences/normalize';
import type { PreferencesAccount } from 'preferences/types';
import { type IdleOptions } from 'preferences/types';
import { type WalletAccount } from 'wallets/types';

import { type ExtensionStorage } from '../storage/storage';
import { type NetworkController } from './network';

function isOldWavesAccount(account: unknown): account is OldWavesAccount {
  return (
    typeof account === 'object' &&
    account !== null &&
    !('accountType' in account) &&
    typeof (account as OldWavesAccount).address === 'string' &&
    typeof (account as OldWavesAccount).publicKey === 'string' &&
    typeof (account as OldWavesAccount).network === 'string' &&
    typeof (account as OldWavesAccount).name === 'string'
  );
}

export class PreferencesController extends EventEmitter {
  store;
  private getNetwork;
  private networkController;

  constructor({
    extensionStorage,
    initLangCode,
    getNetwork,
    networkController,
  }: {
    extensionStorage: ExtensionStorage;
    initLangCode: string | null | undefined;
    getNetwork: NetworkController['getNetwork'];
    networkController: NetworkController;
  }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        currentLocale: initLangCode || 'en',
        idleOptions: { type: '1h', interval: 60 * 60 * 1000 },
        accounts: [],
        selectedAccount: undefined,
      }),
    );

    extensionStorage.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.networkController = networkController;
  }

  getAccounts() {
    const { accounts } = this.store.getState();

    return accounts;
  }

  getSelectedAccount() {
    return this.store.getState().selectedAccount;
  }

  setCurrentLocale(key: string) {
    this.store.updateState({ currentLocale: key });
  }

  setIdleOptions(options: IdleOptions) {
    this.store.updateState({ idleOptions: options });
  }

  syncAccounts(fromKeyrings: WalletAccount[]) {
    const oldAccounts: PreferencesAccount[] = this.store.getState().accounts;
    const currentNetwork = this.getNetwork();
    const accounts: PreferencesAccount[] = [];
    fromKeyrings.forEach((account, i) => {
      if (isOldWavesAccount(account)) {
        const normalized = normalizeOldWavesAccount(account);
        if (normalized) {
          accounts.push(normalized);
          return;
        }
      }
      if (account.accountType === 'multichain') {
        const multichainPreferences: PreferencesAccount = {
          ...(account as Extract<WalletAccount, { accountType: 'multichain' }>),
          chain: 'all',
          network: NetworkProfile.Mainnet,
          type: 'seed',
          lastUsed: oldAccounts.find(
            oldAcc =>
              oldAcc.accountType === 'multichain' && oldAcc.id === account.id,
          )?.lastUsed,
        };
        accounts.push(multichainPreferences);
      } else if (account.type === 'wx') {
        accounts.push({
          ...account,
          ...(typeof (account as { uuid?: string }).uuid === 'string'
            ? { uuid: (account as { uuid: string }).uuid }
            : {}),
          ...(typeof (account as { username?: string }).username === 'string'
            ? { username: (account as { username: string }).username }
            : {}),
          lastUsed: oldAccounts.find(
            oldAcc =>
              oldAcc.accountType === 'waves' &&
              oldAcc.address === account.address &&
              oldAcc.network === account.network,
          )?.lastUsed,
        } as PreferencesAccount);
      } else {
        accounts.push({
          ...account,
          lastUsed: oldAccounts.find(
            oldAcc =>
              oldAcc.accountType === 'waves' &&
              oldAcc.address === account.address &&
              oldAcc.network === account.network,
          )?.lastUsed,
        } as PreferencesAccount);
      }
    });
    this.store.updateState({ accounts });
    this.ensureSelectedAccountInCurrentNetwork();
  }

  ensureSelectedAccountInCurrentNetwork() {
    const currentProfile =
      this.networkController?.getProfile() || NetworkProfile.Mainnet;
    const currentNetworkId =
      this.networkController?.getCurrentNetworkId() || 'waves-mainnet';
    const { accounts, selectedAccount } = this.store.getState();

    const currentProfileAccounts = accounts.filter(account => {
      if (account.accountType === 'multichain') {
        return true;
      }

      if (account.accountType === 'waves') {
        if (currentProfile === NetworkProfile.Mainnet) {
          return (
            account.network === NetworkProfile.Mainnet ||
            account.network === 'mainnet'
          );
        } else {
          return (
            account.network === NetworkProfile.Testnet ||
            account.network === 'testnet' ||
            account.network === 'stagenet' ||
            account.network === 'custom'
          );
        }
      }

      return false;
    });

    const selectedId = selectedAccount?.id;
    const selectedType = selectedAccount?.accountType;

    const isSelectedAccountValid =
      selectedAccount &&
      currentProfileAccounts.some(
        account =>
          account.id === selectedId && account.accountType === selectedType,
      );

    if (!isSelectedAccountValid && currentProfileAccounts.length > 0) {
      this.selectAccountByIdAndType(
        currentProfileAccounts[0].id,
        currentProfileAccounts[0].accountType,
      );
    }
  }

  selectAccountByIdAndType(
    id: string | undefined,
    accountType: string | undefined,
  ) {
    const { accounts, selectedAccount } = this.store.getState();
    const selectedId = selectedAccount?.id;
    const selectedType = selectedAccount?.accountType;
    if (!selectedAccount || selectedId !== id || selectedType !== accountType) {
      addBreadcrumb({
        type: 'user',
        category: 'account-change',
        level: 'info',
        message: 'Change active account',
      });
      if (selectedAccount) {
        accounts.forEach(acc => {
          if (acc.id === selectedId && acc.accountType === selectedType) {
            acc.lastUsed = Date.now();
          }
        });
      }
      this.store.updateState({
        accounts,
        selectedAccount: accounts.find(
          account => account.id === id && account.accountType === accountType,
        ),
      });
      this.emit('accountChange');
    }
  }

  selectAccount(addressOrId: string | undefined, networkOrType: string) {
    const { accounts, selectedAccount } = this.store.getState();
    let account: PreferencesAccount | undefined;
    if (networkOrType === 'multichain') {
      account = accounts.find(
        acc => acc.accountType === 'multichain' && acc.id === addressOrId,
      );
    } else {
      account = accounts.find(
        acc =>
          acc.accountType === 'waves' &&
          acc.address === addressOrId &&
          acc.network === networkOrType,
      );
    }
    if (!account) return;
    this.store.updateState({
      accounts,
      selectedAccount: account,
    });
    this.emit('accountChange');
  }

  addLabel(address: string, label: string, network: string) {
    const { accounts, selectedAccount } = this.store.getState();
    const account = accounts.find(
      current =>
        current.accountType === 'waves' &&
        current.address === address &&
        current.network === network,
    );
    if (!account) {
      throw new Error(
        `Account with address "${address}" in ${network} not found`,
      );
    }
    account.name = label;
    const selectedAddress =
      selectedAccount?.accountType === 'waves'
        ? selectedAccount.address
        : undefined;
    this.store.updateState({
      accounts,
      // selectedAccount can point to a separate object, not an accounts array
      // item, so we need to update it explicitly
      selectedAccount:
        selectedAccount &&
        selectedAccount.accountType === 'waves' &&
        address === selectedAddress
          ? account
          : selectedAccount,
    });
  }
}
