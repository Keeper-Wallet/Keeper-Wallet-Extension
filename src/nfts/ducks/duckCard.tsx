import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { getNftInfo } from 'nfts/ducks/utils';

export function DuckCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const duck = getNftInfo(nft);

  return (
    <NftCard>
      <NftCover
        src={duck?.fgImage}
        bgImage={duck?.bgImage}
        bgColor={duck?.bgColor}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{duck?.name}</NftFooter>
    </NftCard>
  );
}
