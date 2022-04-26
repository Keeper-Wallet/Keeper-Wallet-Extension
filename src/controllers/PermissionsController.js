import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';
import { uniq } from 'ramda';
import { allowMatcher } from '../constants';
import { ERRORS } from '../lib/KeeperError';

export const PERMISSIONS = {
  ALL: 'all',
  USE_API: 'useApi',
  USE_NOTIFICATION: 'useNotifications',
  REJECTED: 'rejected',
  APPROVED: 'approved',
  AUTO_SIGN: 'allowAutoSign',
  GET_MESSAGES: 'allowMessages',
};

const findPermissionFabric = permission => item => {
  if (typeof item === 'string') {
    return item === permission;
  }

  const { type } = item;
  return type === permission;
};

export class PermissionsController {
  constructor({ localStore, remoteConfig, getSelectedAccount, identity }) {
    const defaults = {
      origins: {},
      blacklist: [],
      whitelist: [],
      inPending: {},
    };
    this.store = new ObservableStore(localStore.getInitState(defaults));
    localStore.subscribe(this.store);

    this.remoteConfig = remoteConfig;
    this._updateByConfig();
    this.getSelectedAccount = getSelectedAccount;
    this.identity = identity;
  }

  getMessageIdAccess(origin) {
    const { inPending } = this.store.getState();
    return inPending[origin] || null;
  }

  setMessageIdAccess(origin, messageId) {
    this.updateState({ inPending: { [origin]: messageId } });
  }

  getPermissions(origin) {
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

  getPermission(origin, permission) {
    const permissions = this.getPermissions(origin);
    const permissionType =
      typeof permission === 'string' ? permission : permission.type;
    const findPermission = findPermissionFabric(permissionType);
    return permissions.find(findPermission);
  }

  hasPermission(origin, permission) {
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

  deletePermissions(origin) {
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

  setPermissions(origin, permissions) {
    this.setMessageIdAccess(origin, null);
    this.updateState({ origins: { [origin]: permissions } });
  }

  setPermission(origin, permission) {
    if (this.hasPermission(origin, permission)) {
      return null;
    }

    const permissions = [...(this.getPermissions(origin) || [])];
    permissions.push(permission);
    this.setPermissions(origin, permissions);
  }

  deletePermission(origin, permission) {
    const permissionType =
      typeof permission === 'string' ? permission : permission.type;
    const findPermission = findPermissionFabric(permissionType);
    const permissions = this.getPermissions(origin).filter(
      item => !findPermission(item)
    );
    this.setPermissions(origin, permissions);
  }

  setNotificationPermissions(origin, canUse, time = 0) {
    this.updatePermission(origin, {
      type: PERMISSIONS.USE_NOTIFICATION,
      time,
      canUse,
    });
  }

  setAutoApprove(origin, { interval, totalAmount }) {
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

    const newAutoSign = { ...autoSign, interval, totalAmount };
    this.updatePermission(origin, newAutoSign);
  }

  matcherOrdersAllow(origin, tx) {
    if (!allowMatcher.filter(item => origin.includes(item)).length) {
      return false;
    }

    return ['1001', '1002', '1003'].includes(String(tx.type).trim());
  }

  canUseNotification(origin, time_interval) {
    const useApi = this.getPermission(origin, PERMISSIONS.APPROVED);
    const { whitelist = [] } = this.store.getState();
    const isInWhiteList = whitelist.includes(origin);
    const permission = this.getPermission(origin, PERMISSIONS.USE_NOTIFICATION);
    const hasPermission = !!permission && permission.canUse != null;
    const allowByPermission =
      (hasPermission && permission.canUse) || (!hasPermission && isInWhiteList);

    if (!useApi || !allowByPermission) {
      throw ERRORS.API_DENIED();
    }
    const time = (permission && permission.time) || 0;
    const delta = Date.now() - time;
    const minInterval = time_interval;
    const waitTime = minInterval - delta;

    if (waitTime > 0) {
      throw ERRORS.NOTIFICATION_ERROR({
        msg: `Min notification interval ${minInterval / 1000}s. Wait ${
          waitTime / 1000
        }s.`,
      });
    }

    return true;
  }

  async canApprove(origin, tx) {
    const account = this.getSelectedAccount();
    switch (account.type) {
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

    let { totalAmount = 0, interval = 0, approved = [] } = permission;
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
    this.updatePermission(origin, { ...permission, approved });
    return true;
  }

  updatePermission(origin, permission) {
    const findPermission = findPermissionFabric(permission.type || permission);
    const permissions = [
      ...this.getPermissions(origin).filter(item => !findPermission(item)),
      permission,
    ];
    this.setPermissions(origin, permissions);
  }

  updateState(state) {
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

  _updatePermissionByList(list, permission, type) {
    const { origins } = this.store.getState();
    const newOrigins = list.reduce(
      (acc, origin) => {
        const permissions = acc[origin] || [];
        if (!permissions.includes(permission)) {
          permissions.push(permission);
        }
        if (!permissions.includes(type)) {
          permissions.push(type);
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

const getTxAmount = tx => {
  let result = {
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
    return result.fee.amount.add(result.amount.amount);
  }

  return null;
};

const getTxReceiveAmount = tx => {
  const fee = { amount: null, assetId: null };
  const amount = { amount: null, assetId: null };

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

const getTxMassReceiveAmount = tx => {
  const fee = { amount: null, assetId: null };
  const amount = { amount: null, assetId: null };

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

const getTxDataAmount = tx => {
  const fee = { amount: null, assetId: null };
  const amount = { amount: new BigNumber(0), assetId: 'WAVES' };

  if (tx.data.fee) {
    fee.amount = moneyLikeToBigNumber(tx.data.fee, 8);
    fee.assetId = tx.data.fee.assetId || 'WAVES';
  }

  return { amount, fee };
};

const getPackAmount = txs => {
  const fee = { amount: new BigNumber(0), assetId: 'WAVES' };
  const amount = { amount: new BigNumber(0), assetId: null };

  for (const tx of txs) {
    let result;

    if (tx.type === 4) {
      result = getTxReceiveAmount(tx);
    } else if (tx.type === 11) {
      result = getTxMassReceiveAmount(tx);
    } else if (tx.type === 12) {
      result = getTxDataAmount(tx);
    }

    if (
      (result && result.fee.assetId !== result.amount.assetId) ||
      result.fee.assetId !== 'WAVES'
    ) {
      return { amount, fee: { assetId: null, amount: null } };
    }

    amount.assetId = result.amount.assetId;
    fee.assetId = result.fee.assetId;
    amount.amount = amount.amount.add(result.amount.amount);
    fee.amount = fee.amount.add(result.fee.amount);
    result = null;
  }

  return { fee, amount };
};

const moneyLikeToBigNumber = (moneyLike, precession) => {
  if (typeof moneyLike === 'string' || typeof moneyLike === 'number') {
    const sum = new BigNumber(moneyLike);
    return sum.isNaN() ? new BigNumber(0) : sum;
  }

  const { coins = 0, tokens = 0 } = moneyLike;
  const tokensAmount = new BigNumber(tokens).mul(10 ** precession);
  const coinsAmount = new BigNumber(coins);

  if (!coinsAmount.isNaN() && coinsAmount.gt(0)) {
    return coinsAmount;
  }

  if (!tokensAmount.isNaN()) {
    return tokensAmount;
  }

  return new BigNumber(0);
};
