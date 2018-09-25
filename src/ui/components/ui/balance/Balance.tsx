import * as React from 'react';
import cn from 'classnames';
import { Money } from '@waves/data-entities';
import * as styles from './balance.styl';
import { Loader } from '../loader';

const SEPARATOR = '.';

export const Balance = ({ balance, split, showAsset, isShortFormat, children, ...props }: IProps) => {

    if (!balance) {
        return <div><
            Loader/> {children}</div>
    }

    const tokens = (isShortFormat ? balance.toFormat() : balance.toTokens()).split('.');
    const assetName = showAsset ? balance.asset.name : null;

    if (!split) {
        return <div {...props}>{tokens.join(SEPARATOR)} {assetName} {children}</div>;
    }

    return <div {...props}>
        <span className="font600">{tokens[0]}</span>
        {SEPARATOR}
        <span>{tokens[1]}</span>
        <span className={styles.assetNameMargin}>{assetName}</span>
        {children}
        </div>;
};

interface IProps {
    balance: Money;
    split?: boolean;
    showAsset?: boolean;
    isShortFormat?: boolean;
    children?: any;
}

