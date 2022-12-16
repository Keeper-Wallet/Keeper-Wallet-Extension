import { BigNumber } from '@waves/bignumber';
import {
  MessageInputTx,
  MessageInputTxData,
  MessageInputTxMassTransfer,
  MessageInputTxPackage,
  MessageInputTxTransfer,
} from 'messages/types';
import ObservableStore from 'obs-store';
import { PERMISSIONS } from 'permissions/constants';
import {
  PermissionObject,
  PermissionType,
  PermissionValue,
} from 'permissions/types';
import { IMoneyLike } from 'ui/utils/converters';

import { ERRORS } from '../lib/keeperError';
import { ExtensionStorage, StorageLocalState } from '../storage/storage';
import { RemoteConfigController } from './remoteConfig';

const findPermissionFabric =
  (permission: PermissionType) => (item: PermissionValue) => {
    if (typeof item === 'string') {
      return item === permission;
    }

    const { type } = item;
    return type === permission;
  };

type PermissionsStoreState = Pick<
  StorageLocalState,
  'origins' | 'whitelist' | 'inPending'
>;

function getTxAmount(tx: MessageInputTx | MessageInputTxPackage) {
  const result = Array.isArray(tx)
    ? getTxPackageAmount(tx)
    : tx.type === 4
    ? getTransferTxAmount(tx)
    : tx.type === 11
    ? getMassTransferTxAmount(tx)
    : tx.type === 12
    ? getDataTxAmount(tx)
    : null;

  return result &&
    result.fee.assetId === 'WAVES' &&
    result.amount.assetId === 'WAVES'
    ? result.fee.amount.add(result.amount.amount)
    : null;
}

function moneyLikeToBigNumber(
  moneyLike: IMoneyLike | string | number,
  precision: number
) {
  if (typeof moneyLike === 'string' || typeof moneyLike === 'number') {
    const sum = new BigNumber(moneyLike);
    return sum.isNaN() ? new BigNumber(0) : sum;
  }

  const { coins = 0, tokens = 0 } = moneyLike;
  const tokensAmount = new BigNumber(tokens).mul(10 ** precision);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coinsAmount = new BigNumber(coins as any);

  if (!coinsAmount.isNaN() && coinsAmount.gt(0)) {
    return coinsAmount;
  }

  if (!tokensAmount.isNaN()) {
    return tokensAmount;
  }

  return new BigNumber(0);
}

function getFeeAmount(tx: MessageInputTx) {
  return tx.data.fee
    ? {
        amount: moneyLikeToBigNumber(tx.data.fee, 8),
        assetId: tx.data.fee.assetId ?? 'WAVES',
      }
    : { amount: null, assetId: null };
}

function getTransferTxAmount(tx: MessageInputTxTransfer) {
  return {
    amount: tx.data.amount
      ? {
          amount: moneyLikeToBigNumber(tx.data.amount, 8),
          assetId: tx.data.amount.assetId ?? 'WAVES',
        }
      : { amount: null, assetId: null },
    fee: getFeeAmount(tx),
  };
}

function getMassTransferTxAmount(tx: MessageInputTxMassTransfer) {
  return {
    amount: {
      amount: tx.data.transfers.reduce(
        (acc, transfer) => acc.add(moneyLikeToBigNumber(transfer.amount, 8)),
        new BigNumber(0)
      ),
      assetId: tx.data.totalAmount.assetId,
    },
    fee: getFeeAmount(tx),
  };
}

function getDataTxAmount(tx: MessageInputTxData) {
  return {
    amount: { amount: new BigNumber(0), assetId: 'WAVES' },
    fee: getFeeAmount(tx),
  };
}

function getTxPackageAmount(txs: MessageInputTxPackage) {
  const amount = { amount: new BigNumber(0), assetId: 'WAVES' };
  const fee = { amount: new BigNumber(0), assetId: 'WAVES' };

  for (const tx of txs) {
    const result =
      tx.type === 4
        ? getTransferTxAmount(tx)
        : tx.type === 11
        ? getMassTransferTxAmount(tx)
        : tx.type === 12
        ? getDataTxAmount(tx)
        : undefined;

    if (
      !result ||
      result.amount.assetId !== 'WAVES' ||
      result.fee.assetId !== 'WAVES'
    ) {
      return {
        amount: { assetId: null, amount: null },
        fee: { assetId: null, amount: null },
      };
    }

    amount.amount = amount.amount.add(result.amount.amount);
    fee.amount = fee.amount.add(result.fee.amount);
  }

  return { fee, amount };
}

export class PermissionsController {
  private store;
  private remoteConfig;

  constructor({
    extensionStorage,
    remoteConfig,
  }: {
    extensionStorage: ExtensionStorage;
    remoteConfig: RemoteConfigController;
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        origins: {},
        whitelist: [],
        inPending: {},
      })
    );

    extensionStorage.subscribe(this.store);

    this.remoteConfig = remoteConfig;
    this._updateByConfig();
  }

  getMessageIdAccess(origin: string) {
    const { inPending } = this.store.getState();
    return inPending[origin] || null;
  }

  setMessageIdAccess(origin: string, messageId: string | null) {
    this.updateState({ inPending: { [origin]: messageId } });
  }

  getPermissions(origin: string) {
    const { origins, whitelist } = this.store.getState();
    const permissions = origins[origin] || [];

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
    const { whitelist } = other;

    if (whitelist.includes(origin)) {
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

  canAutoSign(origin: string, tx: MessageInputTx | MessageInputTxPackage) {
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

    if (
      approved
        .reduce((acc, item) => acc.add(item.amount), txAmount)
        .gt(totalAmount)
    ) {
      return false;
    }

    this.updatePermission(origin, {
      ...(permission as PermissionObject),
      approved: approved.concat({
        time: currentTime,
        amount: txAmount.toString(),
      }),
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
    const inPending = { ...oldInPending, ...(state.inPending || {}) };
    Object.keys(origins).forEach(key => {
      origins[key] = Array.from(new Set(origins[key] || []));
    });
    const newState = {
      ...oldState,
      ...state,
      origins,
      whitelist,
      inPending,
    };

    this.store.updateState(newState);
  }

  _updateBlackWhitelist() {
    const { whitelist } = this.store.getState();
    this._updatePermissionByList(whitelist, PERMISSIONS.APPROVED, 'whiteList');
  }

  _updatePermissionByList(
    list: string[],
    permission: PermissionType,
    type: 'whiteList'
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
    const { whitelist } = this.remoteConfig.store.getState();
    this.updateState({ whitelist });
    // eslint-disable-next-line @typescript-eslint/no-shadow
    this.remoteConfig.store.subscribe(({ whitelist }) => {
      this.updateState({ whitelist });
      this._updateBlackWhitelist();
    });
  }
}
