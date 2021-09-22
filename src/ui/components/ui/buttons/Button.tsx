import * as React from 'react';
import * as styles from './buttons.styl';
import cn from 'classnames';

export const BUTTON_TYPE = {
    SUBMIT: 'submit',
    SUBMIT_TINY: 'submitTiny',
    GENERAL: 'submit',
    TRANSPARENT: 'transparent',
    ICON: 'icon',
    WARNING: 'warning',
    DANGER: 'danger',
    INTERFACE: 'interface',
    CUSTOM: 'custom'
};

export function Button({ className, type, withIcon, children, ...props }: IProps ) {

    const btnClassName = cn(
        className,
        styles.button,
        {
            [styles.submit]: type === BUTTON_TYPE.SUBMIT,
            [styles.submitTiny]: type === BUTTON_TYPE.SUBMIT_TINY,
            [styles.submit]: type === BUTTON_TYPE.GENERAL,
            [styles.transparent]: type === BUTTON_TYPE.TRANSPARENT,
            [styles.icon]: withIcon,
            [styles.warning]: type === BUTTON_TYPE.WARNING,
            [styles.danger]: type === BUTTON_TYPE.DANGER,
            [styles.interface]: type === BUTTON_TYPE.INTERFACE,
            [styles.custom]: type === BUTTON_TYPE.CUSTOM,
            [styles.default]: !type
        }
    );

    return (
        <button
            type={type}
            className={btnClassName}
            {...props}>
            {children}
        </button>
    );
}

interface IProps {
    children?: any;
    className?: string;
    onClick?: any;
    type?: any;
    withIcon?: boolean;
    disabled?: any;
}
