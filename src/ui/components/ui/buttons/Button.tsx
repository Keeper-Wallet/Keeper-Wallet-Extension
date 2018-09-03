import * as React from 'react';
import * as styles from './buttons.styl';
import cn from 'classnames';

export function Button({ className, type, children, ...props }: IProps ) {

    const btnClassName = cn(
        className,
        styles.button,
        {
            [styles.submit]: type === 'submit',
            [styles.transparent]: type === 'transparent',
        }
    );

    return (
        <button
            className={btnClassName}
            {...props}
        >
            {children}
        </button>
    );
}

interface IProps {
    children?: any;
    className?: string;
    onClick?: any;
    type?: any;
    disabled?: any;
}
