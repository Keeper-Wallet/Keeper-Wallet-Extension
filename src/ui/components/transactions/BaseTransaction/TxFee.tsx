import { useFeeOptions } from 'fee/useFeeOptions';
import {
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from 'fee/utils';
import * as React from 'react';
import { Message } from 'ui/components/transactions/BaseTransaction/index';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { updateTransactionFee } from '../../../actions';
import { getMoney } from '../../../utils/converters';
import { Balance, Select, SelectItem } from '../../ui';
import { getFee } from './parseTx';

interface Props {
  message?: Message;
}

export function TxFee({ message: messageProp }: Props) {
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets);

  const balance = useAppSelector(
    state => state.balances[state.selectedAccount.address]
  );

  const messageFromState = useAppSelector(state => state.activePopup?.msg);

  const message = messageProp || messageFromState;
  const initialFee = getMoney(message?.data?.data?.initialFee, assets);
  const fee = getMoney(getFee({ ...message?.data?.data }), assets);

  const spendingAmounts = getSpendingAmountsForSponsorableTx({
    assets,
    message,
  });

  let feeOptions = useFeeOptions({
    initialFee,
    txType: message.data.type,
  }).filter(option =>
    isEnoughBalanceForFeeAndSpendingAmounts({
      assetBalance: option.assetBalance,
      fee: option.money,
      spendingAmounts,
    })
  );

  if (feeOptions.findIndex(opt => opt.money.asset.id === fee.asset.id) === -1) {
    feeOptions = feeOptions.concat({
      assetBalance: balance.assets[fee.asset.id],
      money: fee,
    });
  }

  return (
    <div>
      {feeOptions.length <= 1 ? (
        <Balance isShortFormat={true} balance={fee} showAsset={true} />
      ) : (
        <Select
          fill
          selectList={feeOptions.map(
            (option): SelectItem<string> => ({
              id: option.money.asset.id,
              value: option.money.getTokens().toFixed(),
              text: `${option.money.toFormat()} ${
                option.money.asset.displayName
              }`,
            })
          )}
          selected={fee.asset.id}
          onSelectItem={(id, tokens) => {
            dispatch(
              updateTransactionFee(message.id, {
                tokens: tokens,
                assetId: id as string,
              })
            );
          }}
        />
      )}
    </div>
  );
}
