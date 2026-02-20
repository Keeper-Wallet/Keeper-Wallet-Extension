import { ErrorMessage, Input, type InputProps } from '..';
import * as styles from './Input.module.css';

type Props = Extract<InputProps, { multiLine?: false }> & {
  value: string;
  addressError?: string;
};

export function AddressInput({ value, addressError, ...props }: Props) {
  return (
    <div className={styles.container}>
      <Input error={!!addressError} value={value} {...props} />
      <ErrorMessage className={styles.error} show={!!addressError}>
        {addressError}
      </ErrorMessage>
    </div>
  );
}
