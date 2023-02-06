import clsx from 'clsx';
import { useState } from 'react';
import { Ellipsis } from 'ui/components/ui';

import { InfoIcon } from '../icons/info';
import * as styles from './nftCard.module.css';
import { DisplayMode, type Nft } from './types';

export function NftCover({
  className,
  nft,
}: {
  className?: string;
  nft: Nft | undefined;
}) {
  const [isLoading, setLoading] = useState(true);
  const [errorsCount, setErrorsCount] = useState(0);

  if (errorsCount > 1) {
    return (
      <div className={clsx(styles.noContent, className)}>
        <InfoIcon className={styles.noContentIcon} />
        <span>Can’t preview this NFT</span>
      </div>
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      className={clsx(styles.cover, className, isLoading && 'skeleton-glow')}
      poster={nft?.foreground}
      style={nft?.background}
      onLoadedData={() => {
        setLoading(false);
      }}
    >
      <source
        src={nft?.foreground}
        onError={() => {
          setErrorsCount(count => count + 1);
        }}
      />
      <img
        src={nft?.foreground}
        onLoad={() => {
          setLoading(false);
        }}
        onError={() => {
          setErrorsCount(count => count + 1);
        }}
      />
    </video>
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
      className={clsx(styles.card, className)}
      onClick={() => !isPlaceholder && onClick(nft)}
    >
      <NftCover nft={nft} />
      <figcaption
        className={clsx(styles.footer, isPlaceholder && 'skeleton-glow')}
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
