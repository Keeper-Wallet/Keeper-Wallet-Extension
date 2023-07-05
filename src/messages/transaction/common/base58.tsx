import { isPrintableString } from '_core/isPrintableString';
import {
  base58Decode,
  base58Encode,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import clsx from 'clsx';

import * as styles from './base58.module.css';

interface Props {
  base58: string;
  className?: string;
}

export function Base58({ base58, className, ...otherProps }: Props) {
  const decodedString = utf8Decode(base58Decode(base58));
  const isPrintable = isPrintableString(decodedString);

  return (
    <div
      className={clsx(
        className,
        styles.root,
        isPrintable ? styles.root_plain : styles.root_base58,
      )}
      {...otherProps}
    >
      {isPrintable ? decodedString : base58Encode(utf8Encode(decodedString))}
    </div>
  );
}
