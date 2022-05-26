import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { DuckInfo, fetchDuck } from 'nfts/ducks/utils';
import { ducksApiUrl } from 'nfts/ducks/constants';

export function DuckCard({
  nft,
  onInfoClick,
}: {
  nft: AssetDetail;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const [duck, setDuck] = React.useState<DuckInfo>();

  React.useEffect(() => {
    fetchDuck(nft).then(setDuck);
  }, [nft]);

  return (
    <NftCard>
      <NftCover
        src={duck && ducksApiUrl + duck.fgImage}
        bgImage={duck?.bgImage}
        bgColor={duck?.bgColor}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>{duck?.name}</NftFooter>
    </NftCard>
  );
}
