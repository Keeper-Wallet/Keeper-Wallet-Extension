import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';
import { NftCard, NftCover, NftFooter } from 'nfts/nftCard';
import { useAppSelector } from 'ui/store';
import { NFT } from 'nfts/utils';
import {
  ducksArtefactApiUrl,
  ducksArtefactsDApp,
} from 'nfts/duckArtifacts/constants';
import * as styles from 'nfts/nftList.module.css';

export function DucksArtefactCard({
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
  const nftInfo =
    nfts[nft.id]?.vendor === NFT.DucksArtefact ? nfts[nft.id] : null;
  const count =
    mode === 'creator'
      ? Object.values(nfts).filter(nft => nft.creator === ducksArtefactsDApp)
          .length
      : 0;

  return (
    <NftCard>
      <NftCover
        src={nftInfo && ducksArtefactApiUrl + nftInfo.fgImage}
        onClick={() => onInfoClick(nft.id)}
      />
      <NftFooter>
        {mode === 'name' && <div className={styles.title}>{nftInfo?.name}</div>}
        {mode === 'creator' && (
          <>
            <div className={styles.title}>Ducks Artefacts</div>
            <div>{count}</div>
          </>
        )}
      </NftFooter>
    </NftCard>
  );
}
