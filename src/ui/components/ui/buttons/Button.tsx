import * as React from 'react';
import * as styles from './buttons.styl'

export function Button({ className, children, submit, ...props }: IProps ) {
    return (
        <button
            className={`${className || ''} ${styles.button} ${submit ? styles.submit : ''}`}
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
    submit?: any;
    disabled?: any;
}
