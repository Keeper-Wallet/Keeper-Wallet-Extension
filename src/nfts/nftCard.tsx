import * as styles from 'nfts/nftCard.module.css';
import * as React from 'react';
import cn from 'classnames';
import { Loader } from 'ui/components/ui';
import { useAppSelector } from 'ui/store';
import { createNft } from 'nfts/utils';
import { AssetDetail } from 'ui/services/Background';
import { NftVendor } from 'nfts/index';

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
  onInfoClick,
  className,
  mode = 'name',
}: {
  nft: AssetDetail;
  mode: 'name' | 'creator';
  className?: string;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nfts = useAppSelector(state => state.nfts);
  const info = Object.values(NftVendor).includes(nfts[nft.id]?.vendor)
    ? nfts[nft.id]
    : null;

  const nftDetails = createNft(nft, info);

  const count =
    mode === 'creator'
      ? Object.values(nfts).filter(
          item => item?.creator === nftDetails?.creator
        ).length
      : 0;

  return (
    <div className={cn(styles.card, className)}>
      <NftCover
        src={nftDetails?.foreground}
        isVideo={nftDetails?.isVideo}
        onClick={() => onInfoClick(nftDetails?.id)}
      />
      <NftFooter>
        {mode === 'name' && (
          <div className={styles.title}>{nftDetails?.name}</div>
        )}
        {mode === 'creator' && (
          <>
            <div className={styles.title}>{nftDetails?.displayCreator}</div>
            <div>{count}</div>
          </>
        )}
      </NftFooter>
    </div>
  );
}
