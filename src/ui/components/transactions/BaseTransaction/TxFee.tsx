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

const WAVES_MIN_FEE = DEFAULT_FEE_CONFIG.calculate_fee_rules.default.fee;

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
  function getOption(assetId: string): {
    id: string;
    value: string;
    text: string;
    name: string;
  } {
    const tokens = convert(initialFee, assets[assetId]).getTokens();
    return {
      id: assetId,
      value: tokens.toFixed(),
      text: `${tokens.toFormat()} ${
        (assets && assets[assetId].displayName) || assetId
      }`,
      name: (assets && assets[assetId].displayName) || assetId,
    };
  }

  return (
    <div>
      {!isEditable ? (
        <Balance isShortFormat={true} balance={fee} showAsset={true} />
      ) : (
        <Select
          className="fullwidth"
          selectList={[getOption('WAVES')].concat(
            Object.keys(sponsoredBalance)
              .map(getOption)
              .sort((a, b) => a.name.localeCompare(b.name))
          )}
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

function convert(fee: Money, toAsset: Asset): Money {
  const isFromWaves = fee.asset.id === 'WAVES';
  const isToWaves = toAsset.id === 'WAVES';

  if (isFromWaves === isToWaves) {
    return fee;
  }

  const convertCoins = isFromWaves ? fromWaves : toWaves;
  const sponsorship = isFromWaves
    ? toAsset.minSponsoredFee
    : fee.asset.minSponsoredFee;
  return new Money(convertCoins(fee.toCoins(), sponsorship), toAsset);
}

type Amount = string | number | BigNumber;

function fromWaves(wavesFee: Amount, sponsorship: Amount) {
  if (wavesFee == 0 || sponsorship == 0) return 0;
  return new BigNumber(wavesFee)
    .mul(new BigNumber(sponsorship))
    .div(new BigNumber(WAVES_MIN_FEE))
    .roundTo(0, BigNumber.ROUND_MODE.ROUND_UP);
}

function toWaves(assetFee: Amount, sponsorship: Amount) {
  if (assetFee == 0 || sponsorship == 0) return 0;
  return new BigNumber(assetFee)
    .mul(new BigNumber(WAVES_MIN_FEE))
    .div(new BigNumber(sponsorship))
    .roundTo(0, BigNumber.ROUND_MODE.ROUND_UP);
}
