import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';

export function DuckNft({ nft }: { nft: AssetDetail & { assetId: string } }) {
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
  }, []);

  return <img src={imageUrl} />;
}
