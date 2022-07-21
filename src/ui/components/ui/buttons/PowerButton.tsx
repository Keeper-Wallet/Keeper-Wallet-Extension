import * as React from 'react';
import styles from './powerBtn.styl';
import cn from 'classnames';

export function PowerButton({
  className,
  onClick,
  enabled,
  children,
  ...props
}: IProps) {
  const btnClassName = cn(className, styles.powerBtn, {
    [styles.powerBtnOn]: enabled,
  });

  return (
    <button onClick={onClick} className={btnClassName} {...props}>
      {children}
    </button>
  );
}

interface IProps {
  className?: string;
  onClick?: (...args: unknown[]) => void;
  enabled?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}
