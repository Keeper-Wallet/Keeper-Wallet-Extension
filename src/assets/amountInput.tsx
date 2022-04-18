import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useIMask } from 'react-imask';
import { BalanceAssets } from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import { useAppSelector } from 'ui/store';
import * as styles from './amountInput.module.css';
import { AssetSelect } from './assetSelect';
import { UsdAmount } from '../ui/components/ui/UsdAmount';

interface Props {
  assetBalances: BalanceAssets;
  assetOptions: AssetDetail[];
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
  const assets = useAppSelector(state => state.assets);
  const network = useAppSelector(state => state.currentNetwork);
  const asset = balance.asset;

  const mask = useIMask({
    mapToRadix: ['.', ','],
    mask: Number,
    radix: '.',
    scale: asset.precision,
    thousandsSeparator: ' ',
  });

  const valueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);

  React.useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  React.useEffect(() => {
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
  }, []);

  React.useEffect(() => {
    const input = mask.ref.current;
    const maskInstance = mask.maskRef.current;

    if (input && maskInstance && maskInstance.unmaskedValue !== value) {
      input.value = value;
      maskInstance.updateValue();
      maskInstance.updateControl();
    }
  }, [value]);

  const bigNumberValue = new BigNumber(value || '0');
  const tokens = Money.fromTokens(bigNumberValue, asset).getTokens();

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.label}>{label}</div>

        <div className={styles.balance}>
          <Trans i18nKey="assetAmountInput.balanceLabel" />:{' '}
          <button
            className={styles.balanceValue}
            disabled={!onBalanceClick}
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
            asset={assets[asset.id]}
            tokens={tokens}
          />
        )}
      </div>
    </div>
  );
}
