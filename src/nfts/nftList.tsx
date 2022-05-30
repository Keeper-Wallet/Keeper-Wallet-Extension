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

function getNftCard(nft: AssetDetail) {
  switch (nftType(nft)) {
    case NFT.Ducks:
      return DuckCard;
    case NFT.BabyDucks:
      return BabyDuckCard;
    case NFT.SignArt:
      return SignArtCard;
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
    len: number;
    onInfoClick: (assetId: string) => void;
    onSendClick: (assetId: string) => void;
  };
  index: number;
  style: CSSProperties;
}) => {
  const { rows, len, onInfoClick, onSendClick } = data;

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
          onInfoClick={onInfoClick}
          onSendClick={onSendClick}
        />

        {rows[rightIndex] && (
          <RightNft
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
  sortedNfts,
  onInfoClick,
  onSendClick,
}: {
  sortedNfts: AssetDetail[];
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  // todo display all nfts sorted by issuer
  const listRef = React.useRef<VariableSizeList>();

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [sortedNfts]);

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
