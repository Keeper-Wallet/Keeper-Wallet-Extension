import * as React from 'react';
import * as styles from './Button.module.css';
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
    [styles.default]: !view,
    [styles.icon]: view === 'icon',
    [styles.interface]: view === 'interface',
    [styles.loading]: !!loading,
    [styles.submitTiny]: view === 'submitTiny',
    [styles.submit]: view === 'submit',
    [styles.transparent]: view === 'transparent',
    [styles.warning]: view === 'warning',
  })

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  view?: View;
  loading?: boolean;
}

export const Button: React.FC<IProps> = ({
  className,
  view,
  loading,
  children,
  ...props
}: IProps) => {
  const buttonClassName = React.useMemo(
    () => getClassName(className, view, loading),
    [className, view, loading]
  );

  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
};
  
