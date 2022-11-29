import BigNumber from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { useAppSelector } from 'popup/store/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIMask } from 'react-imask';
import { BalanceAssets } from 'store/reducers/updateState';

import { UsdAmount } from '../ui/components/ui/UsdAmount';
import * as styles from './amountInput.module.css';
import { AssetSelect, AssetSelectOption } from './assetSelect';

interface Props {
  assetBalances: BalanceAssets;
  assetOptions: AssetSelectOption[];
  balance: Money;
  label: string;
  showUsdAmount?: boolean;
  value: string;
  onAssetChange: (newAssetId: string) => void;
  onBalanceClick?: () => void;
  onChange: (newValue: string) => void;
}

export function AssetAmountInput({
  assetBalances,
  assetOptions,
  balance,
  label,
  showUsdAmount,
  value,
  onAssetChange,
  onBalanceClick,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const network = useAppSelector(state => state.currentNetwork);
  const asset = balance.asset;

  const mask = useIMask({
    mapToRadix: ['.', ','],
    mask: Number,
    radix: '.',
    scale: asset.precision,
    thousandsSeparator: ' ',
  });

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  useEffect(() => {
    const input = mask.ref.current;
    const maskInstance = mask.maskRef.current;

    if (!input || !maskInstance) {
      return;
    }

    function inputListener() {
      if (valueRef.current !== maskInstance.unmaskedValue) {
        onChangeRef.current(maskInstance.unmaskedValue);
      }
    }

    input.addEventListener('input', inputListener, false);

    return () => {
      input.removeEventListener('input', inputListener, false);
    };
  }, [mask.ref, mask.maskRef]);

  useEffect(() => {
    const input = mask.ref.current;
    const maskInstance = mask.maskRef.current;

    if (input && maskInstance && maskInstance.unmaskedValue !== value) {
      input.value = value;
      maskInstance.updateValue();
      maskInstance.updateControl();
    }
  }, [value, mask.ref, mask.maskRef]);

  const bigNumberValue = new BigNumber(value || '0');
  const tokens = Money.fromTokens(bigNumberValue, asset).getTokens();

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.label}>{label}</div>

        <div className={styles.balance}>
          {t('assetAmountInput.balanceLabel')}:{' '}
          <button
            className={styles.balanceValue}
            disabled={!onBalanceClick}
            type="button"
            onClick={onBalanceClick}
          >
            {balance.getTokens().toFixed()}
          </button>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.assetSelect}>
          <AssetSelect
            assetBalances={assetBalances}
            network={network}
            options={assetOptions}
            value={asset.id}
            onChange={onAssetChange}
          />
        </div>

        <input
          className={styles.input}
          data-testid="amountInput"
          maxLength={23}
          placeholder="0.0"
          ref={mask.ref as React.MutableRefObject<HTMLInputElement>}
        />

        {showUsdAmount && (
          <UsdAmount
            className={styles.usdAmount}
            id={asset.id}
            tokens={tokens}
          />
        )}
      </div>
    </div>
  );
}
