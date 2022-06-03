import * as styles from 'ui/components/pages/nfts/nftHeader.module.css';
import * as React from 'react';
import cn from 'classnames';

export function NftHeader({
  title,
  creator,
  className,
}: {
  title: string;
  creator?: string;
  className?: string;
}) {
  return (
    <div className={cn(styles.header, className)}>
      <div className={styles.title}>{title}</div>
      {creator && <div className={styles.creator}>{creator}</div>}
    </div>
  );
}
