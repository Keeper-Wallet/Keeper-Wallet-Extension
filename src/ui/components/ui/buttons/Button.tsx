import * as React from 'react';
import * as styles from './buttons.styl';
import cn from 'classnames';

export enum ButtonType {
  BUTTON = 'button',
  RESET = 'reset',
  SUBMIT = 'submit',
}

export enum ButtonView {
  CUSTOM = 'custom',
  DANGER = 'danger',
  ICON = 'icon',
  INTERFACE = 'interface',
  SUBMIT = 'submit',
  SUBMIT_TINY = 'submitTiny',
  TRANSPARENT = 'transparent',
  WARNING = 'warning',
}

export function Button({
  id,
  className,
  loading,
  type,
  view,
  withIcon,
  children,
  ...props
}: IProps) {
  const btnClassName = cn(className, styles.button, {
    [styles.button_loading]: loading,
    [styles.submit]: view === ButtonView.SUBMIT,
    [styles.submitTiny]: view === ButtonView.SUBMIT_TINY,
    [styles.transparent]: view === ButtonView.TRANSPARENT,
    [styles.icon]: withIcon,
    [styles.warning]: view === ButtonView.WARNING,
    [styles.danger]: view === ButtonView.DANGER,
    [styles.interface]: view === ButtonView.INTERFACE,
    [styles.custom]: view === ButtonView.CUSTOM,
    [styles.default]: !view,
  });

  return (
    <button id={id} type={type} className={btnClassName} {...props}>
      {children}
    </button>
  );
}

interface IProps {
  id?: any;
  children?: any;
  className?: string;
  loading?: boolean;
  onClick?: any;
  type?: ButtonType;
  view?: ButtonView;
  withIcon?: boolean;
  disabled?: any;
}
