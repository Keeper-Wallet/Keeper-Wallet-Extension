import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { useAppSelector } from 'ui/store';
import { NFT } from 'nfts/utils';
import { ducksArtefactApiUrl } from 'nfts/duckArtifacts/constants';

export function DucksArtefactCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nftInfo = useAppSelector(state => {
    const info = state.nfts[nft.id];
    return info?.vendor === NFT.DucksArtefact ? info : null;
  });

  return (
    <NftCard>
      <NftCover
        src={nftInfo && ducksArtefactApiUrl + nftInfo.fgImage}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{nftInfo?.name}</NftFooter>
    </NftCard>
  );
}
