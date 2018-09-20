import * as React from 'react';
import cn from 'classnames';
import { Money } from '@waves/data-entities';

const SEPARATOR = '.';

export const Balance = ({ balance, split, showAsset, isShortFormat, children, ...props }: IProps) => {

    if (!balance) {
        return <div>N/A {children}</div>
    }

    const tokens = (isShortFormat ? balance.toFormat() : balance.toTokens()).split('.');
    const assetName = showAsset ? balance.asset.name : null;

    if (!split) {
        return <div {...props}>{tokens.join(SEPARATOR)} {assetName} {children}</div>;
    }

    return <div {...props}>
        <span>{tokens[0]}</span>
        {SEPARATOR}
        <span>{tokens[1]}</span>
        {assetName}
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

