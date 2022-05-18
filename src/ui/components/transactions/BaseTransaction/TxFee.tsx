import { Balance, Select } from '../../ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { BalanceAssets } from './TxInfo';
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import { DEFAULT_FEE_CONFIG } from '../../../../constants';
import { updateTransactionFee } from '../../../actions';
import { getMoney, IMoneyLike } from '../../../utils/converters';
import { getFee } from './parseTx';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { omit } from 'ramda';
import { AppState } from 'ui/store';
import { AssetDetail } from 'ui/services/Background';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction/index';

const WAVES_MIN_FEE = DEFAULT_FEE_CONFIG.calculate_fee_rules.default.fee;

type FeeOption = {
  id: string;
  value: string;
  text: string;
  name: string;
};

export const TxFee = connect(
  (
    store: AppState,
    ownProps?: Partial<
      Pick<ComponentProps, 'message' | 'assets' | 'sponsoredBalance'>
    >
  ) => {
    const message = ownProps?.message || store.activePopup?.msg;
    const assets = ownProps?.assets || store.assets;

    const fee = getMoney(getFee({ ...message?.data?.data }), assets);
    const initialFee = getMoney(message?.data?.data?.initialFee, assets);

    const minSponsorBalance: Money = convertFee(initialFee, assets['WAVES']);

    const sponsoredBalance = Object.entries(
      (ownProps.sponsoredBalance as BalanceAssets) || {}
    ).filter(
      ([assetId, assetBalance]) =>
        new BigNumber(assetBalance.sponsorBalance).gte(
          minSponsorBalance.getCoins()
        ) &&
        new BigNumber(assetBalance.balance).gte(
          convertFee(initialFee, assets[assetId]).getCoins()
        )
    );

    const isEditable =
      !!sponsoredBalance.length &&
      [TRANSACTION_TYPE.TRANSFER, TRANSACTION_TYPE.INVOKE_SCRIPT].includes(
        message.data.type
      ) &&
      (fee.asset.displayName === 'WAVES' || !!fee.asset.minSponsoredFee);

    return {
      message,
      fee,
      initialFee,
      assets,
      isEditable,
      sponsoredBalance: Object.fromEntries(sponsoredBalance),
    };
  },
  { updateTransactionFee }
)(function TxFee({
  isEditable = false,
  fee,
  initialFee,
  assets,
  sponsoredBalance,
  updateTransactionFee,
  message,
}: Partial<Pick<ComponentProps, 'message' | 'assets' | 'sponsoredBalance'>> & {
  isEditable: boolean;
  fee: Money;
  initialFee: Money;
  updateTransactionFee?: (
    id: string,
    fee: IMoneyLike
  ) => Record<string, unknown>;
}) {
  function getOption(assetId: string): FeeOption {
    const tokens = convertFee(
      initialFee,
      new Asset(assets[assetId])
    ).getTokens();
    return {
      id: assetId,
      value: tokens.toFixed(),
      text: `${tokens.toFormat()} ${assets[assetId].displayName || assetId}`,
      name: assets[assetId].displayName || assetId,
    };
  }

  const options: FeeOption[] = [];
  if ('WAVES' in sponsoredBalance || initialFee.asset.id === 'WAVES') {
    options.push(getOption('WAVES'));
    sponsoredBalance = omit(['WAVES'], sponsoredBalance);
  }
  if (initialFee.asset.id !== 'WAVES') {
    options.push(getOption(initialFee.asset.id));
    sponsoredBalance = omit([initialFee.asset.id], sponsoredBalance);
  }
  options.push(
    ...Object.keys(sponsoredBalance)
      .map(getOption)
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  return (
    <div>
      {!isEditable || options.length <= 1 ? (
        <Balance isShortFormat={true} balance={fee} showAsset={true} />
      ) : (
        <Select
          fill
          selectList={options}
          selected={fee.asset.id}
          onSelectItem={(id, tokens) =>
            updateTransactionFee(message.id, {
              tokens: tokens,
              assetId: id as string,
            })
          }
        />
      )}
    </div>
  );
});

function convertFee(from: Money, toAsset: Asset | AssetDetail): Money {
  const isWaves = (assetId: string) => assetId === 'WAVES';
  const minSponsoredFee = (asset: Asset | AssetDetail) =>
    !isWaves(asset.id) ? asset.minSponsoredFee : WAVES_MIN_FEE;
  return new Money(
    new BigNumber(from.toCoins())
      .mul(new BigNumber(minSponsoredFee(toAsset)))
      .div(new BigNumber(minSponsoredFee(from.asset)))
      .roundTo(0, BigNumber.ROUND_MODE.ROUND_UP),
    toAsset as Asset
  );
}
