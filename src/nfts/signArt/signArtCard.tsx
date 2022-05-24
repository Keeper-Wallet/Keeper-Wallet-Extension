import { AssetDetail } from 'ui/services/Background';
import * as React from 'react';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { getNftInfo, SignArtInfo } from 'nfts/signArt/utils';

const cache = {};

export function SignArtCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const [signArt, setSignArt] = React.useState<SignArtInfo>();

  React.useEffect(() => {
    if (!Object.hasOwnProperty.call(cache, nft.id)) {
      cache[nft.id] = getNftInfo(nft);
    }

    cache[nft.id].then(details => {
      setSignArt(details);
    });
  }, [nft]);

  return (
    <NftCard>
      <NftCover
        src={signArt?.fgImage}
        isVideo={signArt?.isVideo}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{signArt?.name}</NftFooter>
    </NftCard>
  );
}
