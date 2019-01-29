import * as React from 'react';
import * as styles from './buttons.styl';
import * as myStyles from './powerBtn.styl';
import cn from 'classnames';


export function PowerButton({ className, onClick, enabled, children, ...props }: IProps ) {
    
    const btnClassName = cn(
        className,
        styles.button,
        styles.transparent,
        styles.icon,
        myStyles.powerBtn,
        {
            [myStyles.powerBtnOn]: enabled,
        }
    );

    return (
        <button
            onClick={onClick}
            className={btnClassName}
            {...props}
        >
            {children}
        </button>
    );
}

interface IProps {
    className?: string;
    onClick?: (...args: any) => any;
    enabled?: boolean;
    children?: any;
    disabled?: boolean;

}
