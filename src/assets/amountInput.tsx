import BigNumber from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import { IMaskInput } from 'react-imask';
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
  onChange: (newValue: string, newMaskedValue: string) => void;
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
  const network = usePopupSelector(state => state.currentNetwork);
  const asset = balance.asset;

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

        <div className={styles.inputWrapper}>
          <IMaskInput
            className={styles.input}
            data-testid="amountInput"
            mapToRadix={['.', ',']}
            mask={Number}
            maxLength={23}
            placeholder="0.0"
            radix="."
            scale={asset.precision}
            thousandsSeparator={' '}
            onAccept={(_, mask) => {
              onChange(mask.unmaskedValue, mask.value);
            }}
          />
        </div>

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
