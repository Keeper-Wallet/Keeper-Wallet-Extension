import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { useAppSelector } from 'ui/store';
import { babyDucksApiUrl, babyDucksDApp } from 'nfts/babyDucks/constants';
import { NFT } from 'nfts/utils';

export function BabyDuckCard({
  nft,
  onInfoClick,
  mode = 'name',
}: {
  nft: AssetDetail;
  mode: 'name' | 'creator';
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nfts = useAppSelector(state => state.nfts);
  const nftInfo = nfts[nft.id]?.vendor === NFT.BabyDucks ? nfts[nft.id] : null;
  const count =
    mode === 'creator'
      ? Object.values(nfts).filter(nft => nft.creator === babyDucksDApp).length
      : 0;

  return (
    <NftCard>
      <NftCover
        src={nftInfo && babyDucksApiUrl + nftInfo.fgImage}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>
        {mode === 'name'
          ? nftInfo?.name
          : mode === 'creator'
          ? `Baby Ducks ${count}`
          : null}
      </NftFooter>
    </NftCard>
  );
}
