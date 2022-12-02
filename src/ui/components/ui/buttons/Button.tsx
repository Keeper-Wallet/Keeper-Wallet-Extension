import clsx from 'clsx';
import { useMemo } from 'react';

import * as styles from './Button.module.css';

type View =
  | 'custom'
  | 'danger'
  | 'icon'
  | 'interfaced'
  | 'submit'
  | 'submitTiny'
  | 'transparent'
  | 'warning';

const getClassName = (className?: string, view?: View, loading?: boolean) =>
  clsx(className, styles.button, {
    [styles.custom]: view === 'custom',
    [styles.danger]: view === 'danger',
    [styles.defaultView]: !view,
    [styles.icon]: view === 'icon',
    [styles.interfaced]: view === 'interfaced',
    [styles.loading]: !!loading,
    [styles.submitTiny]: view === 'submitTiny',
    [styles.submit]: view === 'submit',
    [styles.transparent]: view === 'transparent',
    [styles.warning]: view === 'warning',
  });

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  view?: View;
  loading?: boolean;
}

export const Button: React.FC<Props> = ({
  className,
  view,
  loading,
  type = 'button',
  children,
  ...props
}) => {
  const buttonClassName = useMemo(
    () => getClassName(className, view, loading),
    [className, view, loading]
  );

  return (
    <button type={type} className={buttonClassName} {...props}>
      {children}
    </button>
  );
};
