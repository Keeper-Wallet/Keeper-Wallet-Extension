import cn from 'classnames';
import { useState } from 'react';
import { Ellipsis } from 'ui/components/ui';

import * as styles from './nftCard.module.css';
import { DisplayMode, Nft } from './types';

export function NftCover({
  className,
  nft,
}: {
  className?: string;
  nft: Nft | undefined;
}) {
  const [isLoading, setLoading] = useState(true);
  const isVideo = nft?.foreground ? /\.mp4$/.test(nft?.foreground) : false;

  return isVideo ? (
    <video
      autoPlay
      loop
      className={cn(styles.cover, className, isLoading && 'skeleton-glow')}
      // eslint-disable-next-line react/no-unknown-property
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
  onClick: (nft: Nft) => void;
}) {
  const isPlaceholder = !nft.displayCreator;

  return (
    <figure
      className={cn(styles.card, className)}
      onClick={() => !isPlaceholder && onClick(nft)}
    >
      <NftCover nft={nft} />
      <figcaption
        className={cn(styles.footer, isPlaceholder && 'skeleton-glow')}
      >
        {mode === DisplayMode.Name && (
          <div className={styles.title}>{nft.displayName}</div>
        )}
        {mode === DisplayMode.Creator && (
          <>
            <div className={styles.title}>
              {nft.creator === nft.displayCreator ? (
                <Ellipsis text={nft.creator} size={6} />
              ) : (
                nft.displayCreator
              )}
            </div>

            <div>{count}</div>
          </>
        )}
      </figcaption>
    </figure>
  );
}
