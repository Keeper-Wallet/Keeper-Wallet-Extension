import { BigNumber } from '@waves/bignumber';
import * as crypto from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { FeeConfig } from '../constants';
import { path } from 'ramda';
import { convertFromSa, makeBytes } from '../transactions/utils';
import { AssetInfoController } from './assetInfo';
import { NetworkController } from './network';
import { PreferencesAccount } from 'preferences/types';

const FEE_TYPES = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 1002,
];

const isAccountHasExtraFee = async (address: string, node: string) => {
  try {
    const response = await fetch(
      new URL(`/addresses/scriptInfo/${address}`, node).toString()
    );
    const result = await response.json();
    return result.extraFee;
  } catch (e) {
    return 0;
  }
};

export async function getExtraFee(address: string, node: string) {
  const json = (await fetch(
    new URL(`/addresses/scriptInfo/${address}`, node).toString()
  ).then(res => res.json())) as { extraFee: number };

  return json.extraFee;
}

const WAVES_ID = 'WAVES';

function normalizeAssetId(assetId: string | null) {
  return assetId || WAVES_ID;
}

function getAssetIds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signData: any,
  chainId: number,
  accountType: PreferencesAccount['type']
) {
  const hash = Object.create(null);
  hash[WAVES_ID] = true;

  if (signData.type === 1002) {
    const order = convertFromSa.order(signData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hash[normalizeAssetId((order as any).matcherFeeAssetId)] = true;
    hash[normalizeAssetId(order.assetPair.amountAsset)] = true;
    hash[normalizeAssetId(order.assetPair.priceAsset)] = true;
  } else {
    const transaction = convertFromSa.transaction(
      signData,
      chainId,
      accountType
    );

    hash[normalizeAssetId(transaction.feeAssetId)] = true;

    switch (transaction.type) {
      case TRANSACTION_TYPE.REISSUE:
      case TRANSACTION_TYPE.BURN:
      case TRANSACTION_TYPE.MASS_TRANSFER:
      case TRANSACTION_TYPE.SPONSORSHIP:
      case TRANSACTION_TYPE.TRANSFER:
        hash[normalizeAssetId(transaction.assetId)] = true;
        break;
      case TRANSACTION_TYPE.INVOKE_SCRIPT:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction.payment.forEach((payment: any) => {
          hash[normalizeAssetId(payment.assetId)] = true;
        });
        break;
    }
  }

  return Object.keys(hash);
}

function currentCreateOrderFactory(config: FeeConfig, minOrderFee: BigNumber) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (order: any, hasScript = false, smartAssetIdList: unknown[] = []) => {
    const accountFee = hasScript
      ? new BigNumber(config.smart_account_extra_fee)
      : new BigNumber(0);
    const extraFee = Object.values(order.assetPair)
      .map(id => {
        return id && smartAssetIdList.includes(id)
          ? new BigNumber(config.smart_asset_extra_fee)
          : new BigNumber(0);
      })
      .reduce((sum, item) => sum.add(item), new BigNumber(0));

    return minOrderFee.add(accountFee).add(extraFee);
  };
}

function currentFeeFactory(config: FeeConfig) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bytes: any,
    hasAccountScript: boolean,
    smartAssetIdList: string[]
  ) => {
    const accountFee = hasAccountScript
      ? new BigNumber(config.smart_account_extra_fee)
      : new BigNumber(0);
    const minFee = accountFee.add(getConfigProperty(tx.type, 'fee', config));

    switch (tx.type) {
      case TRANSACTION_TYPE.CANCEL_LEASE:
      case TRANSACTION_TYPE.ALIAS:
      case TRANSACTION_TYPE.LEASE:
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      case TRANSACTION_TYPE.SPONSORSHIP:
      case TRANSACTION_TYPE.INVOKE_SCRIPT:
        return minFee;
      case TRANSACTION_TYPE.REISSUE:
      case TRANSACTION_TYPE.BURN:
      case TRANSACTION_TYPE.TRANSFER:
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
        return minFee.add(
          getSmartAssetFeeByAssetId(tx.assetId, config, smartAssetIdList || [])
        );
      case TRANSACTION_TYPE.MASS_TRANSFER:
        return minFee.add(
          getMassTransferFee(tx, config, smartAssetIdList || [])
        );
      case TRANSACTION_TYPE.SET_SCRIPT:
        return tx.script ? accountFee.add(getScriptFee(tx, config)) : minFee;
      case TRANSACTION_TYPE.DATA:
        return accountFee.add(getDataFee(bytes, tx, config));
      case TRANSACTION_TYPE.ISSUE:
        return getIssueFee(tx, accountFee, config);
      default:
        throw new Error('Wrong transaction type!');
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNFT(tx: any) {
  const { quantity, precision, decimals, reissuable } = tx;
  const nftQuantity = new BigNumber(quantity).eq(1);
  const nftPrecision = new BigNumber(precision || decimals || 0).eq(0);
  return !reissuable && nftPrecision && nftQuantity;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIssueFee(tx: any, accountFee: any, config: FeeConfig) {
  const minFee = accountFee.add(getConfigProperty(tx.type, 'fee', config));
  if (isNFT(tx)) {
    return accountFee.add(getConfigProperty(tx.type, 'nftFee', config));
  } else {
    return minFee;
  }
}

function getSmartAssetFeeByAssetId(
  assetId: string,
  config: FeeConfig,
  smartAssetIdList: string[]
) {
  return assetId && smartAssetIdList.includes(assetId)
    ? new BigNumber(config.smart_asset_extra_fee)
    : new BigNumber(0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDataFee(bytes: any, tx: any, config: FeeConfig) {
  const kbPrice = getConfigProperty(tx.type, 'price_per_kb', config) || 0;
  return new BigNumber(kbPrice).mul(Math.floor(1 + (bytes.length - 1) / 1024));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getScriptFee(tx: any, config: FeeConfig) {
  const bytes = crypto.base64Decode(
    tx.script.toString().startsWith('base64:') ? tx.script.slice(7) : tx.script
  );
  const kbPrice = getConfigProperty(tx.type, 'price_per_kb', config) || 0;
  return new BigNumber(Math.ceil(bytes.length / 1024) * kbPrice);
}

function getMassTransferFee(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  config: FeeConfig,
  smartAssetIdList: string[]
) {
  const transferPrice = new BigNumber(
    getConfigProperty(tx.type, 'price_per_transfer', config) || 0
  );
  const transfersCount = (path(['transfers', 'length'], tx) as number) || 0;
  const smartAssetExtraFee =
    tx.assetId && smartAssetIdList.includes(tx.assetId)
      ? new BigNumber(config.smart_asset_extra_fee)
      : new BigNumber(0);
  const minPriceStep = new BigNumber(
    getConfigProperty(tx.type, 'min_price_step', config)
  );
  let price = transferPrice.mul(transfersCount);

  if (!price.div(minPriceStep).isInt()) {
    price = price
      .div(minPriceStep)
      .roundTo(0, BigNumber.ROUND_MODE.ROUND_UP)
      .mul(minPriceStep);
  }

  return price.add(smartAssetExtraFee);
}

function getConfigProperty(
  type: string,
  propertyName: string,
  config: FeeConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const value = path(['calculate_fee_rules', type, propertyName], config);
  return value == null
    ? path(['calculate_fee_rules', 'default', propertyName], config)
    : value;
}

function getOrderFee(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signData: any,
  config: FeeConfig,
  minOrderFee: BigNumber,
  hasMatcherScript: boolean,
  smartAssetIdList: string[]
) {
  const currentFee = currentCreateOrderFactory(config, minOrderFee);
  return currentFee(
    convertFromSa.order(signData),
    hasMatcherScript,
    smartAssetIdList
  );
}

function getFee(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signData: any,
  config: FeeConfig,
  hasScript: boolean,
  smartAssetIdList: string[],
  chainId: number,
  accountType: PreferencesAccount['type']
) {
  const currentFee = currentFeeFactory(config);
  const txData = convertFromSa.transaction(signData, chainId, accountType);
  const bytes = makeBytes.transaction(txData);
  return currentFee(txData, bytes, hasScript, smartAssetIdList);
}

export const calculateFeeFabric =
  (
    assetInfoController: AssetInfoController,
    networkController: NetworkController
  ) =>
  async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signData: any,
    chainId: number,
    account: PreferencesAccount,
    feeConfig: FeeConfig
  ) => {
    const { type } = signData;

    if (!FEE_TYPES.includes(type)) {
      return Object.create(null);
    }
    const node = networkController.getNode();
    const assetIds = getAssetIds(signData, chainId, account.type);
    const assets = await Promise.all(
      assetIds.map(id => assetInfoController.assetInfo(id))
    );
    const smartAssets = assets
      .filter(asset => asset.hasScript)
      .map(asset => asset.id);

    if (type === 1002) {
      const minOrderFee = new BigNumber(300000);
      const matcherAddress = crypto.address(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { public: signData.data.matcherPublicKey } as any,
        networkController.getNetworkCode().charCodeAt(0)
      );
      const extraFee = await isAccountHasExtraFee(matcherAddress, node);
      return getOrderFee(
        signData,
        feeConfig,
        minOrderFee,
        extraFee,
        smartAssets
      );
    }

    const extraFee = await isAccountHasExtraFee(account.address, node);

    return getFee(
      signData,
      feeConfig,
      !!extraFee,
      smartAssets,
      chainId,
      account.type
    );
  };
