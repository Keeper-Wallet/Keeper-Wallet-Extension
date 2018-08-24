import * as React from 'react';
import * as styles from './head.styl';

export function HeadLogo({ className = '', children = null, ...props}) {
    return <div className={`${styles.logo} ${className}`}
                {...props}>
        {children}
    </div>;
}
