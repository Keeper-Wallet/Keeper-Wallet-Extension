import { useFeeOptions } from 'fee/useFeeOptions';
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
  const messageFromState = useAppSelector(state => state.activePopup?.msg);

  const message = messageProp || messageFromState;
  const fee = getMoney(getFee({ ...message?.data?.data }), assets);

  const feeOptions = useFeeOptions({
    initialFee: getMoney(message?.data?.data?.initialFee, assets),
    txType: message.data.type,
  });

  const selectOptions = feeOptions.map(
    ({ money }): SelectItem<string> => ({
      id: money.asset.id,
      value: money.getTokens().toFixed(),
      text: `${money.toFormat()} ${money.asset.displayName}`,
    })
  );

  return (
    <div>
      {selectOptions.length <= 1 ? (
        <Balance isShortFormat={true} balance={fee} showAsset={true} />
      ) : (
        <Select
          fill
          selectList={selectOptions}
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
