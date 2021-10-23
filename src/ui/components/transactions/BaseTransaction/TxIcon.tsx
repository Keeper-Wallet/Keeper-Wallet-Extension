import * as React from 'react';
import cn from 'classnames';

export const TxIcon = ({ txType, small = null, className = '', children = null, ...props }) => {
    className = cn(className, `${txType}-transaction-icon${small ? '-small' : ''}`);
    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
};
