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

interface Props {
  isEditable: boolean;
  fee: Money;
  initialFee: Money;
  assets: any;
  sponsoredBalance: BalanceAssets;
  updateTransactionFee?: (id: string, fee: IMoneyLike) => {};
  message: any;
}

export const TxFee = connect(
  (store: any, ownProps?: any) => {
    const message = ownProps?.message || store.activePopup?.msg;
    const assets = ownProps?.assets || store.assets;

    const fee = getMoney(getFee({ ...message?.data?.data }), assets);

    const isEditable =
      !!ownProps.sponsoredBalance &&
      [TRANSACTION_TYPE.TRANSFER, TRANSACTION_TYPE.INVOKE_SCRIPT].includes(
        message.data.type
      ) &&
      (fee.asset.displayName === 'WAVES' || !!fee.asset.minSponsoredFee);

    return {
      message,
      fee,
      initialFee: getMoney(message?.data?.data?.initialFee, assets),
      assets,
      isEditable,
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
}: Props) {
  function feeInAsset(asset: Asset) {
    const minWavesFee = DEFAULT_FEE_CONFIG.calculate_fee_rules.default.fee;
    const assetTo = new Money(
      asset.id === 'WAVES' ? minWavesFee : asset.minSponsoredFee,
      asset
    );
    const assetFrom = new Money(
      initialFee.asset.id === 'WAVES'
        ? minWavesFee
        : initialFee.asset.minSponsoredFee,
      initialFee.asset
    );

    return initialFee
      .convertTo(asset, assetTo.getTokens().div(assetFrom.getTokens()))
      .getTokens()
      .roundTo(
        Number(!!assetTo.getTokens().getDecimalsCount()) + 1,
        BigNumber.ROUND_MODE.ROUND_UP
      );
  }

  return (
    <div>
      {!isEditable ? (
        <Balance isShortFormat={true} balance={fee} showAsset={true} />
      ) : (
        <Select
          className="fullwidth"
          selectList={Object.entries(sponsoredBalance)
            .concat([['WAVES', null]])
            .map(([assetId]) => {
              const tokens = feeInAsset(assets[assetId]);
              return {
                id: assetId,
                value: tokens.toFormat(),
                text: `${tokens.toFormat()} ${
                  (assets && assets[assetId].displayName) || assetId
                }`,
              };
            })}
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
