import BigNumber from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import ColorHash from 'color-hash';
import * as React from 'react';
import { useIMask } from 'react-imask';
import { useAppSelector } from 'ui/store';
import * as styles from './amountInput.module.css';
import { getAssetLogo } from './utils';
import { Loader } from 'ui/components/ui';
import { Trans } from 'react-i18next';

interface Props {
  balance: Money;
  label: string;
  loading?: boolean;
  value: string;
  onChange?: (newValue: string) => void;
  onMaxClick?: () => void;
}

export function AssetAmountInput({
  balance,
  label,
  loading,
  value,
  onChange,
  onMaxClick,
}: Props) {
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

  const formattedValue = new BigNumber(value || '0').toFormat(
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

  return (
    <div className={styles.root}>
      <div className={styles.logo}>
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
      </div>

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
              <input
                className={styles.input}
                placeholder="0.0"
                ref={mask.ref as React.MutableRefObject<HTMLInputElement>}
                data-testid="amountInput"
              />
            ) : (
              <div className={styles.result} title={formattedValue}>
                {formattedValue}
              </div>
            )}
          </div>

          {onMaxClick && (
            <button
              className={styles.maxButton}
              type="button"
              onClick={onMaxClick}
            >
              <Trans i18nKey="assetAmountInput.maxButtonText" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
