import cn from 'classnames';

import * as styles from './powerBtn.styl';

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
