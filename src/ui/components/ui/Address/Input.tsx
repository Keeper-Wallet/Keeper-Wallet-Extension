import * as React from 'react';
import * as styles from './Input.module.css';
import cn from 'classnames';
import { useAppSelector } from 'ui/store';
import { validators } from '@waves/waves-transactions';
import {
  isValidEthereumAddress,
  fromEthereumToWavesAddress,
  fromWavesToEthereumAddress,
} from 'ui/utils/ethereum';
import { Input, InputProps, Ellipsis, Error } from '..';

interface Props extends InputProps {
  value: string;
  showMirrorAddress?: boolean;
  addressError?: string;
}

export function AddressInput({
  value,
  showMirrorAddress,
  addressError,
  ...props
}: Props) {
  const chainId = useAppSelector(state =>
    state.selectedAccount.networkCode.charCodeAt(0)
  );

  const [type, mirrorAddress] = React.useMemo(() => {
    switch (true) {
      case isValidEthereumAddress(value):
        return ['ethereum', fromEthereumToWavesAddress(value, chainId)];
      case validators.isValidAddress(value):
        return ['waves', fromWavesToEthereumAddress(value)];
      default:
        return [];
    }
  }, [value, chainId]);

  return (
    <div
      className={cn(styles.container, {
        [styles.ethereum]: type === 'ethereum',
        [styles.waves]: type === 'waves',
      })}
    >
      <Input
        wrapperClassName={styles.wrapper}
        className={styles.input}
        error={!!addressError}
        value={value}
        {...props}
      />
      {showMirrorAddress && !!type && (
        <Ellipsis
          className={styles.mirrorAddress}
          text={mirrorAddress}
          size={8}
        />
      )}
      <Error className={styles.error} show={!!addressError}>
        {addressError}
      </Error>
    </div>
  );
}
