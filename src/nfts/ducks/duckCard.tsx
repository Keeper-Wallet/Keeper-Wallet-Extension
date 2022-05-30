import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { ducksApiUrl } from 'nfts/ducks/constants';
import { useAppSelector } from 'ui/store';

export function DuckCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nftInfo = useAppSelector(state => state.nfts[nft.id]);

  return (
    <NftCard>
      <NftCover
        src={nftInfo && ducksApiUrl + nftInfo.fgImage}
        bgImage={nftInfo?.bgImage}
        bgColor={nftInfo?.bgColor}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{nftInfo?.name}</NftFooter>
    </NftCard>
  );
}
