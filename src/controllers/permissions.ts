import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';
import { uniq } from 'ramda';
import { allowMatcher } from '../constants';
import { ERRORS } from '../lib/keeperError';
import { RemoteConfigController } from './remoteConfig';
import ExtensionStore, { StoreLocalState } from 'lib/localStore';
import { PreferencesController } from './preferences';
import { IdentityController } from './IdentityController';
import { IMoneyLike } from 'ui/utils/converters';
import {
  PermissionObject,
  PermissionType,
  PermissionValue,
} from 'permissions/types';
import { PERMISSIONS } from 'permissions/constants';

const findPermissionFabric =
  (permission: PermissionType) => (item: PermissionValue) => {
    if (typeof item === 'string') {
      return item === permission;
    }

    const { type } = item;
    return type === permission;
  };

interface Identity {
  restoreSession: (
    userId: string
  ) => ReturnType<IdentityController['restoreSession']>;
}

type PermissionsStoreState = Pick<
  StoreLocalState,
  'origins' | 'blacklist' | 'whitelist' | 'inPending'
>;

export class PermissionsController {
  private store;
  private remoteConfig;
  private getSelectedAccount;
  private identity;

  constructor({
    localStore,
    remoteConfig,
    getSelectedAccount,
    identity,
  }: {
    localStore: ExtensionStore;
    remoteConfig: RemoteConfigController;
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    identity: Identity;
  }) {
    this.store = new ObservableStore(
      localStore.getInitState({
        origins: {},
        blacklist: [],
        whitelist: [],
        inPending: {},
      })
    );

    localStore.subscribe(this.store);

    this.remoteConfig = remoteConfig;
    this._updateByConfig();
    this.getSelectedAccount = getSelectedAccount;
    this.identity = identity;
  }

  getMessageIdAccess(origin: string) {
    const { inPending } = this.store.getState();
    return inPending[origin] || null;
  }

  setMessageIdAccess(origin: string, messageId: string | null) {
    this.updateState({ inPending: { [origin]: messageId } });
  }

  getPermissions(origin: string) {
    const { origins, blacklist, whitelist } = this.store.getState();
    const permissions = origins[origin] || [];
    if (blacklist.includes(origin)) {
      return [PERMISSIONS.REJECTED];
    }

    if (whitelist.includes(origin) && !permissions.includes(PERMISSIONS.ALL)) {
      return [...permissions, PERMISSIONS.ALL];
    }

    return permissions;
  }

  getPermission(origin: string, permission: PermissionValue) {
    const permissions = this.getPermissions(origin);
    const permissionType =
      typeof permission === 'string' ? permission : permission.type;
    const findPermission = findPermissionFabric(permissionType);
    return permissions.find(findPermission);
  }

  hasPermission(origin: string, permission: PermissionValue) {
    const permissions = this.getPermissions(origin);

    if (!permissions.length) {
      return null;
    }

    if (permissions.includes(PERMISSIONS.REJECTED)) {
      return permission === PERMISSIONS.REJECTED;
    }

    if (
      permissions.includes(PERMISSIONS.ALL) ||
      permissions.includes(permission)
    ) {
      return true;
    }

    return !!this.getPermission(origin, permission);
  }

  deletePermissions(origin: string) {
    const { origins, ...other } = this.store.getState();
    const { whitelist, blacklist } = other;

    if (whitelist.includes(origin) || blacklist.includes(origin)) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(origins, origin)) {
      delete origins[origin];
    }

    this.store.updateState({ ...other, origins });
  }

  setPermissions(origin: string, permissions: PermissionValue[]) {
    this.setMessageIdAccess(origin, null);
    this.updateState({ origins: { [origin]: permissions } });
  }

  setPermission(origin: string, permission: PermissionValue) {
    if (this.hasPermission(origin, permission)) {
      return null;
    }

    const permissions = [...(this.getPermissions(origin) || [])];
    permissions.push(permission);
    this.setPermissions(origin, permissions);
  }

  deletePermission(origin: string, permission: PermissionValue) {
    const permissionType =
      typeof permission === 'string' ? permission : permission.type;
    const findPermission = findPermissionFabric(permissionType);
    const permissions = this.getPermissions(origin).filter(
      item => !findPermission(item)
    );
    this.setPermissions(origin, permissions);
  }

  setNotificationPermissions(origin: string, canUse: boolean, time = 0) {
    this.updatePermission(origin, {
      type: PERMISSIONS.USE_NOTIFICATION,
      time,
      canUse,
    });
  }

  setAutoApprove(
    origin: string,
    {
      interval,
      totalAmount,
    }: Pick<PermissionObject, 'interval' | 'totalAmount'>
  ) {
    if (!interval || !totalAmount) {
      this.deletePermission(origin, PERMISSIONS.AUTO_SIGN);
      return null;
    }

    const autoSign = this.getPermission(origin, PERMISSIONS.AUTO_SIGN);

    if (!autoSign) {
      this.updatePermission(origin, {
        type: PERMISSIONS.AUTO_SIGN,
        approved: [],
        totalAmount,
        interval,
      });

      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newAutoSign = { ...(autoSign as any), interval, totalAmount };
    this.updatePermission(origin, newAutoSign);
  }

  matcherOrdersAllow(
    origin: string,
    tx:
      | {
          type: number;
          data: {
            amount?: IMoneyLike | undefined;
            fee?: IMoneyLike | undefined;
            totalAmount: { assetId: string };
            transfers: Array<{ amount: IMoneyLike }>;
          };
        }
      | Array<{
          type: number;
          data: {
            amount?: IMoneyLike | undefined;
            fee?: IMoneyLike | undefined;
            totalAmount: IMoneyLike;
            transfers: Array<{ amount: IMoneyLike }>;
          };
        }>
  ) {
    if (!allowMatcher.filter(item => origin.includes(item)).length) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ['1001', '1002', '1003'].includes(String((tx as any).type).trim());
  }

  canUseNotification(origin: string, time_interval: number) {
    const useApi = this.getPermission(origin, PERMISSIONS.APPROVED);
    const { whitelist = [] } = this.store.getState();
    const isInWhiteList = whitelist.includes(origin);
    const permission = this.getPermission(origin, PERMISSIONS.USE_NOTIFICATION);

    const hasPermission =
      !!permission && (permission as PermissionObject).canUse != null;

    const allowByPermission =
      (hasPermission && (permission as PermissionObject).canUse) ||
      (!hasPermission && isInWhiteList);

    if (!useApi || !allowByPermission) {
      throw ERRORS.API_DENIED();
    }
    const time = (permission && (permission as PermissionObject).time) || 0;
    const delta = Date.now() - time;
    const minInterval = time_interval;
    const waitTime = minInterval - delta;

    if (waitTime > 0) {
      throw ERRORS.NOTIFICATION_ERROR(undefined, {
        msg: `Min notification interval ${minInterval / 1000}s. Wait ${
          waitTime / 1000
        }s.`,
      });
    }

    return true;
  }

  async canApprove(
    origin: string,
    tx:
      | {
          type: number;
          data: {
            amount?: IMoneyLike | undefined;
            fee?: IMoneyLike | undefined;
            totalAmount: { assetId: string };
            transfers: Array<{ amount: IMoneyLike }>;
          };
        }
      | Array<{
          type: number;
          data: {
            amount?: IMoneyLike | undefined;
            fee?: IMoneyLike | undefined;
            totalAmount: IMoneyLike;
            transfers: Array<{ amount: IMoneyLike }>;
          };
        }>
  ) {
    const account = this.getSelectedAccount();
    switch (account?.type) {
      case 'wx':
        try {
          await this.identity.restoreSession(account.uuid);
        } catch (err) {
          // if we can't restore session, then we can't auto-approve
          return false;
        }
        break;
      default:
        break;
    }

    if (this.matcherOrdersAllow(origin, tx)) {
      return true;
    }

    const permission = this.getPermission(origin, PERMISSIONS.AUTO_SIGN);

    if (!permission) {
      return false;
    }

    const txAmount = getTxAmount(tx);

    if (!txAmount) {
      return false;
    }

    let {
      totalAmount = 0,
      interval = 0,
      approved = [],
    } = permission as PermissionObject;

    const currentTime = Date.now();
    approved = approved.filter(({ time }) => currentTime - time < interval);
    const total = new BigNumber(totalAmount);
    const amount = approved.reduce(
      (acc, { amount }) => acc.add(new BigNumber(amount)),
      new BigNumber(0)
    );

    if (amount.add(txAmount).gt(total)) {
      return false;
    }

    approved.push({ time: currentTime, amount: txAmount.toString() });
    this.updatePermission(origin, {
      ...(permission as PermissionObject),
      approved,
    });
    return true;
  }

  updatePermission(origin: string, permission: PermissionValue) {
    const findPermission = findPermissionFabric(
      (permission as PermissionObject).type || permission
    );
    const permissions = [
      ...this.getPermissions(origin).filter(item => !findPermission(item)),
      permission,
    ];
    this.setPermissions(origin, permissions);
  }

  updateState(state: Partial<PermissionsStoreState>) {
    const {
      origins: oldOrigins,
      inPending: oldInPending,
      ...oldState
    } = this.store.getState();
    const origins = { ...oldOrigins, ...(state.origins || {}) };
    const whitelist = state.whitelist || oldState.whitelist;
    const blacklist = state.blacklist || oldState.blacklist;
    const inPending = { ...oldInPending, ...(state.inPending || {}) };
    Object.keys(origins).forEach(key => {
      origins[key] = uniq(origins[key] || []);
    });
    const newState = {
      ...oldState,
      ...state,
      origins,
      whitelist,
      blacklist,
      inPending,
    };

    this.store.updateState(newState);
  }

  _updateBlackWhitelist() {
    const { blacklist, whitelist } = this.store.getState();
    this._updatePermissionByList(whitelist, PERMISSIONS.APPROVED, 'whiteList');
    this._updatePermissionByList(blacklist, PERMISSIONS.REJECTED, 'blackList');
  }

  _updatePermissionByList(
    list: string[],
    permission: PermissionType,
    type: 'whiteList' | 'blackList'
  ) {
    const { origins } = this.store.getState();
    const newOrigins = list.reduce(
      (acc, origin) => {
        const permissions = acc[origin] || [];
        if (!permissions.includes(permission)) {
          permissions.push(permission);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!permissions.includes(type as any)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          permissions.push(type as any);
        }
        acc[origin] = permissions;
        return acc;
      },
      { ...origins }
    );

    this.updateState({ origins: newOrigins });
  }

  _updateByConfig() {
    const { blacklist, whitelist } = this.remoteConfig.store.getState();
    this.updateState({ blacklist, whitelist });
    this.remoteConfig.store.subscribe(({ blacklist, whitelist }) => {
      this.updateState({ blacklist, whitelist });
      this._updateBlackWhitelist();
    });
  }
}

const getTxAmount = (
  tx:
    | {
        type: number;
        data: {
          amount?: IMoneyLike | undefined;
          fee?: IMoneyLike | undefined;
          totalAmount: { assetId: string };
          transfers: Array<{ amount: IMoneyLike }>;
        };
      }
    | Array<{
        type: number;
        data: {
          amount?: IMoneyLike | undefined;
          fee?: IMoneyLike | undefined;
          totalAmount: IMoneyLike;
          transfers: Array<{ amount: IMoneyLike }>;
        };
      }>
) => {
  let result: {
    fee: {
      amount: BigNumber | null;
      assetId: string | null;
    };
    amount: {
      amount: BigNumber | null;
      assetId: string | null;
    };
  } = {
    fee: { amount: null, assetId: null },
    amount: { amount: null, assetId: null },
  };

  if (Array.isArray(tx)) {
    result = getPackAmount(tx);
  } else if (tx.type === 4) {
    result = getTxReceiveAmount(tx);
  } else if (tx.type === 11) {
    result = getTxMassReceiveAmount(tx);
  } else if (tx.type === 12) {
    result = getTxDataAmount(tx);
  }

  if (
    result.fee.assetId === result.amount.assetId &&
    result.fee.assetId === 'WAVES'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return result.fee.amount!.add(result.amount.amount!);
  }

  return null;
};

const getTxReceiveAmount = (tx: {
  data: {
    amount?: IMoneyLike;
    fee?: IMoneyLike;
  };
}) => {
  const fee: { amount: BigNumber | null; assetId: string | null } = {
    amount: null,
    assetId: null,
  };

  const amount: { amount: BigNumber | null; assetId: string | null } = {
    amount: null,
    assetId: null,
  };

  if (tx.data.fee) {
    fee.amount = moneyLikeToBigNumber(tx.data.fee, 8);
    fee.assetId = tx.data.fee.assetId || 'WAVES';
  }

  if (tx.data.amount) {
    amount.amount = moneyLikeToBigNumber(tx.data.amount, 8);
    amount.assetId = tx.data.amount.assetId || 'WAVES';
  }

  return { amount, fee };
};

const getTxMassReceiveAmount = (tx: {
  data: {
    assetId?: string;
    fee?: IMoneyLike;
    totalAmount: { assetId: string };
    transfers: Array<{ amount: IMoneyLike }>;
  };
}) => {
  const fee: { amount: BigNumber | null; assetId: string | null } = {
    amount: null,
    assetId: null,
  };
  const amount: { amount: BigNumber | null; assetId: string | null } = {
    amount: null,
    assetId: null,
  };

  if (tx.data.fee) {
    fee.amount = moneyLikeToBigNumber(tx.data.fee, 8);
    fee.assetId = tx.data.fee.assetId || 'WAVES';
  }

  amount.assetId = tx.data.assetId || tx.data.totalAmount.assetId;
  amount.amount = tx.data.transfers.reduce((acc, transfer) => {
    return acc.add(moneyLikeToBigNumber(transfer.amount, 8));
  }, new BigNumber(0));

  return { amount, fee };
};

const getTxDataAmount = (tx: { data: { fee?: IMoneyLike } }) => {
  const fee: { amount: BigNumber | null; assetId: string | null } = {
    amount: null,
    assetId: null,
  };

  const amount = { amount: new BigNumber(0), assetId: 'WAVES' };

  if (tx.data.fee) {
    fee.amount = moneyLikeToBigNumber(tx.data.fee, 8);
    fee.assetId = tx.data.fee.assetId || 'WAVES';
  }

  return { amount, fee };
};

const getPackAmount = (
  txs: Array<{
    type?: number;
    data: {
      amount?: IMoneyLike;
      fee?: IMoneyLike;
      totalAmount: IMoneyLike;
      transfers: Array<{ amount: IMoneyLike }>;
    };
  }>
) => {
  const fee = { amount: new BigNumber(0), assetId: 'WAVES' };

  const amount: {
    amount: BigNumber;
    assetId: string | null;
  } = { amount: new BigNumber(0), assetId: null };

  for (const tx of txs) {
    let result:
      | ReturnType<typeof getTxReceiveAmount>
      | ReturnType<typeof getTxMassReceiveAmount>
      | ReturnType<typeof getTxDataAmount>
      | null
      | undefined;

    if (tx.type === 4) {
      result = getTxReceiveAmount(tx);
    } else if (tx.type === 11) {
      result = getTxMassReceiveAmount(tx);
    } else if (tx.type === 12) {
      result = getTxDataAmount(tx);
    }

    if (
      (result && result.fee.assetId !== result.amount.assetId) ||
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result!.fee.assetId !== 'WAVES'
    ) {
      return { amount, fee: { assetId: null, amount: null } };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    amount.assetId = result!.amount.assetId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fee.assetId = result!.fee.assetId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    amount.amount = amount.amount.add(result!.amount.amount!);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fee.amount = fee.amount.add(result!.fee.amount!);
    result = null;
  }

  return { fee, amount };
};

const moneyLikeToBigNumber = (
  moneyLike: IMoneyLike | string | number,
  precession: number
) => {
  if (typeof moneyLike === 'string' || typeof moneyLike === 'number') {
    const sum = new BigNumber(moneyLike);
    return sum.isNaN() ? new BigNumber(0) : sum;
  }

  const { coins = 0, tokens = 0 } = moneyLike;
  const tokensAmount = new BigNumber(tokens).mul(10 ** precession);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coinsAmount = new BigNumber(coins as any);

  if (!coinsAmount.isNaN() && coinsAmount.gt(0)) {
    return coinsAmount;
  }

  if (!tokensAmount.isNaN()) {
    return tokensAmount;
  }

  return new BigNumber(0);
};
