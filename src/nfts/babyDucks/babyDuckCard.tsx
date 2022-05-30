import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { useAppSelector } from 'ui/store';
import { babyDucksApiUrl } from 'nfts/babyDucks/constants';
import { NFT } from 'nfts/utils';

export function BabyDuckCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nftInfo = useAppSelector(state => {
    const info = state.nfts[nft.id];
    return info?.vendor === NFT.BabyDucks ? info : null;
  });

  return (
    <NftCard>
      <NftCover
        src={nftInfo && babyDucksApiUrl + nftInfo.fgImage}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{nftInfo?.name}</NftFooter>
    </NftCard>
  );
}
