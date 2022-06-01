import * as styles from 'nfts/nftCard.module.css';
import * as React from 'react';
import cn from 'classnames';
import { Loader } from 'ui/components/ui';
import { useAppSelector } from 'ui/store';
import { nftType } from 'nfts/utils';
import { ducksArtefactApiUrl } from 'nfts/duckArtifacts/constants';
import { AssetDetail } from 'ui/services/Background';
import { ducksApiUrl, ducksDAppNames } from 'nfts/ducks/constants';
import { ducklingsApiUrl } from 'nfts/ducklings/constants';
import { signArtApiUrl } from 'nfts/signArt/constants';
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
  const nftInfo = Object.values(NftVendor).includes(nfts[nft.id]?.vendor)
    ? nfts[nft.id]
    : null;
  const count =
    mode === 'creator'
      ? Object.values(nfts).filter(nft => nft.creator === nftInfo?.creator)
          .length
      : 0;

  let apiUrl,
    title,
    isVideo = false;
  switch (nftType(nft)) {
    case NftVendor.Ducks:
      apiUrl = ducksApiUrl;
      title = ducksDAppNames[nft.issuer];
      break;
    case NftVendor.Ducklings:
      apiUrl = ducklingsApiUrl;
      title = 'Baby Ducks';
      break;
    case NftVendor.SignArt:
      apiUrl = signArtApiUrl;
      isVideo = !!nftInfo.fgImage.match(/.mp4$/);
      break;
    case NftVendor.DucksArtefact:
      apiUrl = ducksArtefactApiUrl;
      title = 'Ducks Artefacts';
  }

  return (
    <div className={cn(styles.card, className)}>
      <NftCover
        src={nftInfo && apiUrl + nftInfo.fgImage}
        isVideo={isVideo}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>
        {mode === 'name' && (
          <div className={styles.title}>{nftInfo?.name || nft?.name}</div>
        )}
        {mode === 'creator' && (
          <>
            <div className={styles.title}>
              {title || nftInfo?.creator || nft?.name}
            </div>
            <div>{count}</div>
          </>
        )}
      </NftFooter>
    </div>
  );
}
