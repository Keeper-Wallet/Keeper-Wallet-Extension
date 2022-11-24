import cn from 'classnames';

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

  return <div className={cn(styles.loader, 'skeleton-glow', className)} />;
}
