import * as styles from 'nfts/nftCard.module.css';
import * as React from 'react';
import cn from 'classnames';
import { Loader } from 'ui/components/ui';
import { Nft } from 'nfts/utils';
import { DisplayMode } from 'nfts/index';

export function NftCover({ className, nft }: { className?: string; nft: Nft }) {
  const [isLoading, setLoading] = React.useState(true);

  return nft?.isVideo ? (
    <video
      autoPlay
      loop
      className={cn(styles.cover, className, isLoading && 'skeleton-glow')}
      onLoad={() => nft?.foreground && setLoading(false)}
    >
      <source src={nft?.foreground} type="video/mp4" />
    </video>
  ) : (
    <img
      src={nft?.foreground}
      className={cn(styles.cover, className, isLoading && 'skeleton-glow')}
      style={nft?.background}
      onLoad={() => nft?.foreground && setLoading(false)}
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
  mode,
  className,
  onClick,
}: {
  nft: Nft;
  count?: number;
  mode?: DisplayMode;
  className?: string;
  onClick: (asset: Nft) => void;
}) {
  return (
    <div className={cn(styles.card, className)} onClick={() => onClick(nft)}>
      <NftCover className={styles.withTitle} nft={nft} />
      <NftFooter>
        {mode === DisplayMode.Name && (
          <div className={styles.title}>{nft?.displayName}</div>
        )}
        {mode === DisplayMode.Creator && (
          <>
            <div className={styles.title}>{nft?.displayCreator}</div>
            <div>{count}</div>
          </>
        )}
      </NftFooter>
    </div>
  );
}
