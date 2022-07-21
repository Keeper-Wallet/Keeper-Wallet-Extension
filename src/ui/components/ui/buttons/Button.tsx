import * as React from 'react';
import styles from './Button.module.css';
import cn from 'classnames';

type View =
  | 'custom'
  | 'danger'
  | 'icon'
  | 'interface'
  | 'submit'
  | 'submitTiny'
  | 'transparent'
  | 'warning';

const getClassName = (className?: string, view?: View, loading?: boolean) =>
  cn(className, styles.button, {
    [styles.custom]: view === 'custom',
    [styles.danger]: view === 'danger',
    [styles.defaultView]: !view,
    [styles.icon]: view === 'icon',
    [styles.interface]: view === 'interface',
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
  const buttonClassName = React.useMemo(
    () => getClassName(className, view, loading),
    [className, view, loading]
  );

  return (
    <button type={type} className={buttonClassName} {...props}>
      {children}
    </button>
  );
};
