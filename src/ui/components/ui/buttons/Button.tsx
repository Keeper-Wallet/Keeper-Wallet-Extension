import * as React from 'react';
import * as styles from './buttons.styl';
import cn from 'classnames';

export const BUTTON_TYPE = {
    SUBMIT: 'submit',
    TRANSPARENT: 'transparent',
    WARNING: 'warning',
    INTERFACE: 'interface',
};

export function Button({ className, type, children, ...props }: IProps ) {

    const btnClassName = cn(
        className,
        styles.button,
        {
            [styles.submit]: type === BUTTON_TYPE.SUBMIT,
            [styles.transparent]: type === BUTTON_TYPE.TRANSPARENT,
            [styles.warning]: type === BUTTON_TYPE.WARNING,
            [styles.interface]: type === BUTTON_TYPE.INTERFACE,
            [styles.default]: !type
        }
    );

    return (
        <button
            type={type}
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
