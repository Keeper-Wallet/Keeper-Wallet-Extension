import * as React from 'react';
import * as styles from './buttons.styl';
import cn from 'classnames';

export const BUTTON_TYPE = {
    SUBMIT: 'submit',
    TRANSPARENT: 'transparent',
    ICON: 'icon',
    WARNING: 'warning',
    INTERFACE: 'interface',
};

export function Button({ className, type, withIcon, children, ...props }: IProps ) {

    const btnClassName = cn(
        className,
        styles.button,
        {
            [styles.submit]: type === BUTTON_TYPE.SUBMIT,
            [styles.transparent]: type === BUTTON_TYPE.TRANSPARENT,
            [styles.icon]: withIcon,
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
    withIcon?: boolean;
    disabled?: any;

}
