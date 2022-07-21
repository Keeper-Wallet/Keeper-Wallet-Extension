import * as React from 'react';
import styles from './Input.module.css';
import { Input, InputProps, Error } from '..';

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
  return (
    <div className={styles.container}>
      <Input
        wrapperClassName={styles.wrapper}
        className={styles.input}
        error={!!addressError}
        value={value}
        {...props}
      />
      <Error className={styles.error} show={!!addressError}>
        {addressError}
      </Error>
    </div>
  );
}
