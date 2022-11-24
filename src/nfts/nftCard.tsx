import cn from 'classnames';
import { DisplayMode } from 'nfts/index';
import * as styles from 'nfts/nftCard.module.css';
import { Nft } from 'nfts/utils';
import { useState } from 'react';
import { Ellipsis } from 'ui/components/ui';

export function NftCover({
  className,
  nft,
}: {
  className?: string;
  nft: Nft | null | undefined;
}) {
  const [isLoading, setLoading] = useState(true);

  return nft?.isVideo ? (
    <video
      autoPlay
      loop
      className={cn(styles.cover, className, isLoading && 'skeleton-glow')}
      // eslint-disable-next-line react/no-unknown-property
      onLoad={() => nft?.foreground && setLoading(false)}
    >
      <source src={nft?.foreground as string | undefined} type="video/mp4" />
    </video>
  ) : (
    <img
      src={nft?.foreground as string | undefined}
      className={cn(styles.cover, className, isLoading && 'skeleton-glow')}
      style={nft?.background as React.CSSProperties | undefined}
      onLoad={() => nft?.foreground && setLoading(false)}
    />
  );
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
  const isPlaceholder = !nft?.displayCreator;

  return (
    <div
      className={cn(styles.card, className)}
      onClick={() => !isPlaceholder && onClick(nft)}
    >
      <NftCover className={styles.withTitle} nft={nft} />
      <div className={cn(styles.footer, isPlaceholder && 'skeleton-glow')}>
        {mode === DisplayMode.Name && (
          <div className={styles.title}>{nft?.displayName}</div>
        )}
        {mode === DisplayMode.Creator && (
          <>
            <div className={styles.title}>
              {nft?.creator === nft?.displayCreator ? (
                <Ellipsis text={nft?.creator} size={6} />
              ) : (
                nft?.displayCreator
              )}
            </div>
            <div>{count}</div>
          </>
        )}
      </div>
    </div>
  );
}
