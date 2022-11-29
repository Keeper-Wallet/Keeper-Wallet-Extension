import { useFeeOptions } from 'fee/useFeeOptions';
import {
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from 'fee/utils';
import { MessageStoreItem } from 'messages/types';
import { useAppDispatch, useAppSelector } from 'popup/store/react';

import { updateTransactionFee } from '../../../../store/actions/messages';
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.balances[state.selectedAccount?.address!]
  );

  const messageFromState = useAppSelector(
    state => state.activePopup?.msg
  ) as Extract<MessageStoreItem, { type: 'transaction' }>;

  const message = messageProp || messageFromState;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const initialFee = getMoney(message?.data?.data?.initialFee, assets)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fee = getMoney(getFee({ ...message?.data?.data }), assets)!;

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

  if (
    feeOptions.findIndex(opt => opt.money.asset.id === fee.asset.id) === -1 &&
    balance?.assets?.[fee.asset.id]
  ) {
    feeOptions = feeOptions.concat({
      assetBalance: balance.assets[fee.asset.id],
      money: fee,
    });
  }

  return (
    <div data-testid="txFee">
      {feeOptions.length <= 1 ? (
        <Balance isShortFormat balance={fee} showAsset />
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
                tokens,
                assetId: id as string,
              })
            );
          }}
        />
      )}
    </div>
  );
}
