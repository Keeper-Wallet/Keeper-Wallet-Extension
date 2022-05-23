import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import * as styles from './nftDuck.module.css';
import { Loader } from 'ui/components/ui';
import { NftCard } from './nftCard';
import cn from 'classnames';

const duckColors = {
  B: 'ADD8E6',
  R: 'FFA07A',
  Y: 'F8EE9D',
  G: 'D9F6B3',
  U: 'CD6F86',
};

export function NftDuck({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const [imageUrl, setImageUrl] = React.useState<string>();
  const [, genoType, generationColor] = nft.name.split('-');
  // const generation = generationColor[0];
  const color = generationColor[1];

  React.useEffect(() => {
    fetch(`https://wavesducks.com/api/v1/ducks/nft/${nft.id}`)
      .then(resp =>
        resp.ok
          ? resp.json()
          : resp.text().then(text => Promise.reject(new Error(text)))
      )
      .then(duck => {
        setImageUrl(
          `https://wavesducks.com/api/v1/ducks/${genoType}.svg?` +
            `onPerch=${duck.onPerch}` +
            `&color=${duck.perchColor || color}`
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NftCard>
      <div
        className={cn(styles.cover, !imageUrl && 'skeleton-glow')}
        style={{
          backgroundImage: imageUrl && `url(${imageUrl})`,
          backgroundColor: `#${duckColors[color]}`,
        }}
        onClick={() => onInfoClick(nft.id)}
      />
      <div className={styles.footer}>{imageUrl ? nft.name : <Loader />}</div>
    </NftCard>
  );
}
