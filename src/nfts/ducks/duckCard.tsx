import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import * as styles from 'nfts/ducks/duckCard.module.css';
import { NftCard } from 'nfts/nftCard';
import cn from 'classnames';
import { Loader } from 'ui/components/ui';
import { getNftInfo } from 'nfts/ducks/utils';

export function DuckCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const [isLoading, setLoading] = React.useState(true);
  const duck = getNftInfo(nft);

  return (
    <NftCard>
      <img
        src={duck?.fgImage}
        className={cn(styles.cover, isLoading && 'skeleton-glow')}
        style={{
          backgroundImage: duck?.bgImage,
          backgroundColor: duck?.bgColor,
        }}
        onLoad={() => duck && setLoading(false)}
        onClick={() => onInfoClick(nft.id)}
      />
      <div className={styles.footer}>{duck?.name || <Loader />}</div>
    </NftCard>
  );
}
