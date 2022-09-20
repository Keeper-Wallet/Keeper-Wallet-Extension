import * as React from 'react';
import * as styles from './Input.module.css';
import { Input, InputProps, ErrorMessage } from '..';

type Props = Extract<InputProps, { multiLine?: false }> & {
  value: string;
  showMirrorAddress?: boolean;
  addressError?: string;
};

export function AddressInput({
  value,
  showMirrorAddress,
  addressError,
  ...props
}: Props) {
  return (
    <div className={styles.container}>
      <Input error={!!addressError} value={value} {...props} />
      <ErrorMessage className={styles.error} show={!!addressError}>
        {addressError}
      </ErrorMessage>
    </div>
  );
}
