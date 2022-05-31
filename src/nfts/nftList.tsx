import * as React from 'react';
import { CSSProperties } from 'react';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { AssetDetail } from 'ui/services/Background';
import * as styles from './nftList.module.css';
import { nftCardFullHeight } from 'nfts/constants';
import cn from 'classnames';
import { SignArtCard } from 'nfts/signArt/signArtCard';
import { DuckCard } from 'nfts/ducks/duckCard';
import { UnknownCard } from 'nfts/unknown/unknownCard';
import { BabyDuckCard } from 'nfts/babyDucks/babyDuckCard';
import { NFT, nftType } from 'nfts/utils';
import { DucksArtefactCard } from 'nfts/duckArtifacts/ducksArtefactCard';
import { useAppSelector } from 'ui/store';

function getNftCard(nft: AssetDetail) {
  switch (nftType(nft)) {
    case NFT.Ducks:
      return DuckCard;
    case NFT.BabyDucks:
      return BabyDuckCard;
    case NFT.SignArt:
      return SignArtCard;
    case NFT.DucksArtefact:
      return DucksArtefactCard;
    default:
      return UnknownCard;
  }
}

const Row = ({
  data,
  index,
  style,
}: {
  data: {
    rows: AssetDetail[];
    mode: 'name' | 'creator';
    len: number;
    onInfoClick: (assetId: string) => void;
    onSendClick: (assetId: string) => void;
  };
  index: number;
  style: CSSProperties;
}) => {
  const { rows, mode, len, onInfoClick, onSendClick } = data;

  const leftIndex = 2 * index;
  const LeftNft = getNftCard(rows[leftIndex]);

  const rightIndex = leftIndex + 1;
  const RightNft = getNftCard(rows[rightIndex]);

  return (
    <div style={style}>
      <div className={cn(styles.nftRow, len === 1 && styles.noScroll)}>
        <LeftNft
          key={leftIndex}
          nft={rows[leftIndex]}
          mode={mode}
          onInfoClick={onInfoClick}
          onSendClick={onSendClick}
        />

        {rows[rightIndex] && (
          <RightNft
            mode={mode}
            key={rightIndex}
            nft={rows[rightIndex]}
            onInfoClick={onInfoClick}
            onSendClick={onSendClick}
          />
        )}
      </div>
    </div>
  );
};

export function NftList({
  listRef,
  sortedNfts,
  onInfoClick,
  onSendClick,
}: {
  listRef: React.MutableRefObject<VariableSizeList>;
  sortedNfts: AssetDetail[];
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  return (
    <div className={styles.nftList}>
      <AutoSizer>
        {({ height, width }) => {
          const len = Math.round(sortedNfts.length / 2);
          return (
            <VariableSizeList
              ref={listRef}
              height={height}
              width={width}
              itemCount={len}
              itemSize={() => nftCardFullHeight}
              itemData={{ rows: sortedNfts, len, onInfoClick, onSendClick }}
              itemKey={(index, { rows }) => rows[index].id}
            >
              {Row}
            </VariableSizeList>
          );
        }}
      </AutoSizer>
    </div>
  );
}

export function NftGroups({
  listRef,
  sortedNfts,
  onInfoClick,
  onSendClick,
}: {
  listRef: React.MutableRefObject<VariableSizeList>;
  sortedNfts: AssetDetail[];
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nfts = useAppSelector(state => state.nfts);

  const creatorNfts = sortedNfts.reduce<AssetDetail[]>(
    (creatorNfts, current) => {
      if (
        !creatorNfts.find(
          nft => nfts[nft.id]?.creator === nfts[current.id]?.creator
        )
      ) {
        creatorNfts.push(current);
      }
      return creatorNfts;
    },
    []
  );

  return (
    <div className={styles.nftList}>
      <AutoSizer>
        {({ height, width }) => {
          const len = Math.round(creatorNfts.length / 2);
          return (
            <VariableSizeList
              ref={listRef}
              height={height}
              width={width}
              itemCount={len}
              itemSize={() => nftCardFullHeight}
              itemData={{
                rows: creatorNfts,
                mode: 'creator',
                len,
                onInfoClick,
                onSendClick,
              }}
              itemKey={(index, { rows }) => rows[index].id}
            >
              {Row}
            </VariableSizeList>
          );
        }}
      </AutoSizer>
    </div>
  );
}
