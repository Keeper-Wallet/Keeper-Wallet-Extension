import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';

export function UnknownCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  return (
    <NftCard>
      <NftCover src={null} onClick={() => onInfoClick(nft.id)} />
      <NftFooter>{nft?.name}</NftFooter>
    </NftCard>
  );
}
