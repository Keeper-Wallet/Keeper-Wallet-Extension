import * as styles from 'nfts/nftCard.module.css';
import * as React from 'react';
import cn from 'classnames';

export function NftCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(styles.nftCard, className)}>{children}</div>;
}
