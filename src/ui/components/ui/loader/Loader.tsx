import * as React from 'react';
import * as styles from './loader.styl';
import cn from 'classnames';

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
