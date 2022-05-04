import BigNumber from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import ColorHash from 'color-hash';
import * as React from 'react';
import { useIMask } from 'react-imask';
import { useAppSelector } from 'ui/store';
import * as styles from './amountInput.module.css';
import { getAssetLogo } from './utils';
import { Loader } from 'ui/components/ui';
import { useTranslation } from 'react-i18next';
import { UsdAmount } from '../ui/components/ui/UsdAmount';

interface Props {
  balance: Money;
  label: string;
  loading?: boolean;
  showUsdAmount?: boolean;
  value: string;
  onChange?: (newValue: string) => void;
  onLogoClick?: () => void;
  onMaxClick?: () => void;
}

export function AssetAmountInput({
  balance,
  label,
  loading,
  showUsdAmount,
  value,
  onChange,
  onLogoClick,
  onMaxClick,
}: Props) {
  const assets = useAppSelector(state => state.assets);
  const { t } = useTranslation();
  const network = useAppSelector(state => state.currentNetwork);
  const asset = balance.asset;
  const logoSrc = getAssetLogo(network, asset.id);

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
  const formattedValue = bigNumberValue.toFormat(
    asset.precision,
    BigNumber.ROUND_MODE.ROUND_FLOOR,
    {
      fractionGroupSeparator: '',
      fractionGroupSize: 0,
      decimalSeparator: '.',
      groupSeparator: ' ',
      groupSize: 3,
      prefix: '',
      secondaryGroupSize: 0,
      suffix: '',
    }
  );
  const tokens = Money.fromTokens(bigNumberValue, asset).getTokens();

  return (
    <div className={styles.root}>
      <button
        className={styles.logo}
        disabled={!onLogoClick}
        type="button"
        onClick={onLogoClick}
      >
        {logoSrc ? (
          <img className={styles.logoImg} src={logoSrc} alt="" />
        ) : (
          <div
            className={styles.logoPlaceholder}
            style={{
              backgroundColor: new ColorHash().hex(asset.id),
            }}
          >
            {asset.displayName[0].toUpperCase()}
          </div>
        )}
      </button>

      <div className={styles.main}>
        <div className={styles.top}>
          <div className={styles.label}>{label}</div>
          <div className={styles.balance}>{balance.toTokens()}</div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.value}>
            {loading ? (
              <Loader />
            ) : onChange ? (
              <>
                <input
                  className={styles.input}
                  placeholder="0.0"
                  maxLength={23}
                  ref={mask.ref as React.MutableRefObject<HTMLInputElement>}
                  data-testid="amountInput"
                />
                {showUsdAmount && (
                  <UsdAmount
                    className={styles.usdAmount}
                    asset={assets[asset.id]}
                    tokens={tokens}
                  />
                )}
              </>
            ) : (
              <div className={styles.result} title={formattedValue}>
                {formattedValue}
                {showUsdAmount && (
                  <UsdAmount
                    className={styles.usdResult}
                    asset={assets[asset.id]}
                    tokens={tokens}
                  />
                )}
              </div>
            )}
          </div>

          {onMaxClick && (
            <button
              className={styles.maxButton}
              type="button"
              onClick={onMaxClick}
            >
              {t('assetAmountInput.maxButtonText')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
