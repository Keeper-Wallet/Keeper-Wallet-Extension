import * as styles from 'nfts/nftCard.module.css';
import * as React from 'react';
import cn from 'classnames';
import { Loader } from 'ui/components/ui';
import { Nft } from 'nfts/utils';

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

export function NftTitle({ children }: { children: React.ReactNode }) {
  return <div className={styles.title}>{children}</div>;
}

export function NftCard({
  nft,
  count = 0,
  mode = 'name',
  className,
  onInfoClick,
}: {
  nft: Nft;
  count?: number;
  mode?: 'name' | 'creator';
  className?: string;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  return (
    <div className={cn(styles.card, className)}>
      <NftCover
        src={nft?.foreground}
        isVideo={nft?.isVideo}
        onClick={() => onInfoClick(nft?.id)}
      />
      <NftFooter>
        {mode === 'name' && (
          <div className={styles.title}>{nft?.displayName}</div>
        )}
        {mode === 'creator' && (
          <>
            <div className={styles.title}>{nft?.displayCreator}</div>
            <div>{count}</div>
          </>
        )}
      </NftFooter>
    </div>
  );
}
