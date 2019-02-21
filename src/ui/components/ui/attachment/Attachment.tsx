import * as React from 'react';
import { libs } from '@waves/signature-generator';
import * as cn from 'classnames';
import * as styles from './attachment.styl';

const { base58 } = libs;

export const Attachment: React.FunctionComponent<IAttachment> = ({ attachment, className }) => {
    const myClassName = cn(styles.attachment, className);
    let text = '';
    
    if (typeof attachment !== 'string') {
        const bs58text = base58.encode(new Uint8Array(Object.values(attachment)));
        text = `base58:${bs58text}`;
    } else {
        text = attachment;
    }
    
    return <div className={myClassName}>{text}</div>;
};

interface IAttachment {
    attachment: string| Array<number> | Uint8Array;
    className?: string;
}
