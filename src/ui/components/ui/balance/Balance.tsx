import * as React from 'react';
import { ASSETS_NAMES } from '../../../appConfig';
import { Money } from '@waves/data-entities';
import * as styles from './balance.styl';
import { Loader } from '../loader';

const SEPARATOR = '.';

export const Balance = ({ balance, split, addSign=null, showAsset, isShortFormat, children, ...props }: IProps) => {

    if (!balance) {
        return <div>
                <Loader/>
                {children}
            </div>;
    }
    const tokens = (isShortFormat ? balance.toFormat() : balance.toTokens()).split('.');
    const assetName = showAsset ? ASSETS_NAMES[balance.asset.id] || balance.asset.name : null;

    if (!split) {
        return <div {...props}>{tokens.join(SEPARATOR)} {assetName} {children}</div>;
    }

    return <div {...props}>
        {addSign ? <span>{addSign}</span> : null}
        <span className="font600">{tokens[0]}</span>{ tokens[1] ? <span>{SEPARATOR}{tokens[1]}</span> : null }
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
    addSign?: string;
    className?: string;
}
