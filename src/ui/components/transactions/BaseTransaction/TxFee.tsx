import { useFeeOptions } from 'fee/useFeeOptions';
import {
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from 'fee/utils';
import { MessageStoreItem } from 'messages/types';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { updateTransactionFee } from '../../../actions';
import { getMoney } from '../../../utils/converters';
import { Balance, Select, SelectItem } from '../../ui';
import { getFee } from './parseTx';

interface Props {
  message?: Extract<MessageStoreItem, { type: 'transaction' }> | null;
}

export function TxFee({ message: messageProp }: Props) {
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets);

  const balance = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state => state.balances[state.selectedAccount.address!]
  );

  const messageFromState = useAppSelector(
    state => state.activePopup?.msg
  ) as Extract<MessageStoreItem, { type: 'transaction' }>;

  const message = messageProp || messageFromState;
  const initialFee = getMoney(message?.data?.data?.initialFee, assets);
  const fee = getMoney(getFee({ ...message?.data?.data }), assets);

  const spendingAmounts = getSpendingAmountsForSponsorableTx({
    assets,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    message: message!,
  });

  let feeOptions = useFeeOptions({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    initialFee: initialFee!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    txType: message!.data.type,
  }).filter(option =>
    isEnoughBalanceForFeeAndSpendingAmounts({
      assetBalance: option.assetBalance,
      fee: option.money,
      spendingAmounts,
    })
  );

  if (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    feeOptions.findIndex(opt => opt.money.asset.id === fee!.asset.id) === -1
  ) {
    feeOptions = feeOptions.concat({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      assetBalance: balance!.assets![fee!.asset.id],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      money: fee!,
    });
  }

  return (
    <div data-testid="txFee">
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selected={fee!.asset.id}
          onSelectItem={(id, tokens) => {
            dispatch(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              updateTransactionFee(message!.id, {
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
