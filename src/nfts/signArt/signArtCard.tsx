import { AssetDetail } from 'ui/services/Background';
import * as React from 'react';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { ipfsUrl } from 'nfts/signArt/constants';
import { useAppSelector } from 'ui/store';
import { NFT } from 'nfts/utils';

export function SignArtCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nftInfo = useAppSelector(state => {
    const info = state.nfts[nft.id];
    return info?.vendor === NFT.SignArt ? info : null;
  });

  return (
    <NftCard>
      <NftCover
        src={nftInfo && ipfsUrl + nftInfo.fgImage}
        isVideo={nftInfo?.isVideo}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{nftInfo?.name}</NftFooter>
    </NftCard>
  );
}
