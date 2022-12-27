import { Spinner } from '_core/spinner';
import clsx from 'clsx';

import * as styles from './Button.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  view?:
    | 'custom'
    | 'icon'
    | 'submit'
    | 'submitTiny'
    | 'transparent'
    | 'warning';
}

export function Button({
  children,
  className,
  loading,
  type = 'button',
  view,
  ...otherProps
}: Props) {
  return (
    <button
      className={clsx(className, styles.button, {
        [styles.custom]: view === 'custom',
        [styles.defaultView]: !view,
        [styles.icon]: view === 'icon',
        [styles.loading]: loading,
        [styles.submitTiny]: view === 'submitTiny',
        [styles.submit]: view === 'submit',
        [styles.transparent]: view === 'transparent',
        [styles.warning]: view === 'warning',
      })}
      type={type}
      {...otherProps}
    >
      {children}
      {loading && (
        <span className={styles.spinner}>
          <Spinner size={16} />
        </span>
      )}
    </button>
  );
}
