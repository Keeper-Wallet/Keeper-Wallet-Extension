import * as React from 'react';
import cn from 'classnames';

export const TxIcon = ({ txType, className = '', children = null, ...props }) => {
    className = cn(className, `${txType}-transaction-icon`);
    return <div  className={className} {...props}>{children}</div>
};
