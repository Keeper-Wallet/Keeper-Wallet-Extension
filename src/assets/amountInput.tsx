import BigNumber from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import ColorHash from 'color-hash';
import * as React from 'react';
import { useIMask } from 'react-imask';
import { useAppSelector } from 'ui/store';
import * as styles from './amountInput.module.css';
import { getAssetLogo } from './utils';

interface Props {
  balance: Money;
  label: string;
  value: string;
  onChange?: (newValue: string) => void;
}

export function AssetAmountInput({ balance, label, value, onChange }: Props) {
  const network = useAppSelector(state => state.currentNetwork);
  const asset = balance.asset;
  const logoSrc = getAssetLogo(network, asset.id);

  const mask = useIMask(
    {
      mapToRadix: ['.', ','],
      mask: Number,
      radix: '.',
      scale: asset.precision,
      thousandsSeparator: ' ',
    },
    {
      onAccept: (_value, mask) => {
        if (onChange) {
          onChange(mask.unmaskedValue);
        }
      },
    }
  );

  React.useEffect(() => {
    const input = mask.ref.current;
    const maskInstance = mask.maskRef.current;

    if (input && maskInstance && maskInstance.unmaskedValue !== value) {
      input.value = value;
      maskInstance.updateValue();
      maskInstance.updateControl();
    }
  }, [value]);

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

      <div className={styles.left}>
        <div className={styles.label}>{label}</div>
        <div className={styles.assetName}>{asset.displayName}</div>
      </div>

      <div className={styles.right}>
        <div className={styles.balance}>{balance.toTokens()}</div>

        {onChange ? (
          <input
            className={styles.input}
            placeholder="0.0"
            ref={mask.ref as React.MutableRefObject<HTMLInputElement>}
            data-testid="amountInput"
          />
        ) : (
          <div className={styles.result}>
            {new BigNumber(value).toFormat(
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
