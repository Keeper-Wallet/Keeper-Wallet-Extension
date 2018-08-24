import * as React from 'react';
import * as styles from './buttons.styl'

export function Button({ className, children, ...props }: IProps ) {
    return (
        <button
            className={`${className || ''} ${styles.button} ${props.submit ? styles.submit : ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

interface IProps {
    children?: any;
    className?: string;
    onClick?: any;
    submit?: boolean;
}
