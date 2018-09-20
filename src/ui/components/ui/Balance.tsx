import * as React from 'react';
import cn from 'classnames';
import { Money } from '@waves/data-entities';

export const Balance = ({ balance, children, ...props }: IProps) => {

    if (!balance) {
        return <div>N/A {children}</div>
    }

    return <div {...props}>{balance.toFormat()} {children}</div>;
};

interface IProps {
    balance: Money;
    split?: boolean;
    isShortFormat?: boolean;
    children?: any;
}
