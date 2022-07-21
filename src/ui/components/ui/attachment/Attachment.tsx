import * as React from 'react';
import { libs } from '@waves/waves-transactions';
import cn from 'classnames';
import styles from './attachment.styl';

const { base58Encode } = libs.crypto;

export const Attachment: React.FunctionComponent<IAttachment> = ({
  attachment,
  className,
  ...otherProps
}) => {
  const myClassName = cn(styles.attachment, className);
  let text = '';

  if (typeof attachment !== 'string') {
    const bs58text = base58Encode(new Uint8Array(Object.values(attachment)));
    text = `base58:${bs58text}`;
  } else {
    text = attachment;
  }

  return (
    <div className={myClassName} {...otherProps}>
      {text}
    </div>
  );
};

interface IAttachment {
  attachment: string | Array<number> | Uint8Array;
  className?: string;
}
