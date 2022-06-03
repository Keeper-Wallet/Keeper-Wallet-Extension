import * as styles from 'ui/components/pages/nfts/nftHeader.module.css';
import * as React from 'react';

export function NftHeader({
  title,
  creator,
}: {
  title: string;
  creator: string;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.title}>{title}</div>
      <div className={styles.creator}>{creator}</div>
    </div>
  );
}
