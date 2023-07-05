import { isNotNull } from '_core/isNotNull';
import { BigNumber } from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type MessageTx } from 'messages/types';
import ObservableStore from 'obs-store';
import { PERMISSIONS } from 'permissions/constants';
import {
  type PermissionObject,
  type PermissionType,
  type PermissionValue,
} from 'permissions/types';

import { ERRORS } from '../lib/keeperError';
import {
  type ExtensionStorage,
  type StorageLocalState,
} from '../storage/storage';
import { type RemoteConfigController } from './remoteConfig';

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
      }),
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
      item => !findPermission(item),
    );
    this.setPermissions(origin, permissions);
  }

  setNotificationPermissions(origin: string, canUse: boolean | null, time = 0) {
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
    }: Pick<PermissionObject, 'interval' | 'totalAmount'>,
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

  canAutoSign(origin: string, txOrPackage: MessageTx | MessageTx[]) {
    const permission = this.getPermission(origin, PERMISSIONS.AUTO_SIGN);

    if (!permission) {
      return false;
    }

    function getTxAmount(tx: MessageTx) {
      return tx.type === TRANSACTION_TYPE.TRANSFER
        ? tx.assetId
          ? null
          : new BigNumber(tx.amount)
        : tx.type === TRANSACTION_TYPE.MASS_TRANSFER
        ? tx.assetId
          ? null
          : BigNumber.sum(...tx.transfers.map(transfer => transfer.amount))
        : tx.type === TRANSACTION_TYPE.DATA
        ? new BigNumber(0)
        : null;
    }

    function getTxPackageAmount(txs: MessageTx[]) {
      const amounts = txs.map(getTxAmount);

      return amounts.some(amount => amount == null)
        ? null
        : BigNumber.sum(...amounts.filter(isNotNull));
    }

    function getTxFee(tx: MessageTx) {
      return 'feeAssetId' in tx && tx.feeAssetId != null
        ? null
        : new BigNumber(tx.fee);
    }

    function getTxPackageFee(txs: MessageTx[]) {
      const fees = txs.map(getTxFee);

      return fees.some(fee => fee == null)
        ? null
        : BigNumber.sum(...fees.filter(isNotNull));
    }

    function getTotalTxAmount(tx: MessageTx | MessageTx[]) {
      const amount = Array.isArray(tx)
        ? getTxPackageAmount(tx)
        : getTxAmount(tx);
      const fee = Array.isArray(tx) ? getTxPackageFee(tx) : getTxFee(tx);

      return amount && fee ? fee.add(amount) : null;
    }

    const txAmount = getTotalTxAmount(txOrPackage);

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
      (permission as PermissionObject).type || permission,
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
    type: 'whiteList',
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
      { ...origins },
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
