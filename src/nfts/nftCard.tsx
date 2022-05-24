import * as styles from 'nfts/nftCard.module.css';
import * as React from 'react';
import cn from 'classnames';
import { Loader } from 'ui/components/ui';

export function NftCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(styles.card, className)}>{children}</div>;
}

export function NftCover({
  src,
  isVideo,
  bgImage,
  bgColor,
  onClick,
}: {
  src: string;
  isVideo?: boolean;
  bgImage?: string;
  bgColor?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const [isLoading, setLoading] = React.useState(true);

  return isVideo ? (
    <video
      autoPlay
      loop
      className={cn(styles.cover, isLoading && 'skeleton-glow')}
    >
      <source src={src} type="video/mp4" />
    </video>
  ) : (
    <img
      src={src}
      className={cn(styles.cover, isLoading && 'skeleton-glow')}
      style={{
        backgroundImage: bgImage,
        backgroundColor: bgColor,
      }}
      onLoad={() => src && setLoading(false)}
      onClick={onClick}
    />
  );
}

export function NftFooter({ children }: { children: React.ReactNode }) {
  return <div className={styles.footer}>{children ?? <Loader />}</div>;
}
