import clsx from 'clsx';

import * as styles from './loader.styl';

export function Loader({
  hide,
  className,
}: {
  hide?: boolean;
  className?: string;
}) {
  if (hide) {
    return null;
  }

  return <div className={clsx(styles.loader, 'skeleton-glow', className)} />;
}
