import * as React from 'react';
import { CSSProperties } from 'react';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { AssetDetail } from 'ui/services/Background';
import * as styles from './nftList.module.css';
import { nftCardFullHeight } from 'nfts/constants';
import cn from 'classnames';
import { useAppSelector } from 'ui/store';
import { NftCard } from 'nfts/nftCard';
import { createNft } from 'nfts/utils';
import { BaseNft } from 'nfts/index';

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
  const rightIndex = leftIndex + 1;

  return (
    <div style={style}>
      <div className={cn(styles.nftRow, len === 1 && styles.noScroll)}>
        <NftCard
          key={leftIndex}
          nft={rows[leftIndex]}
          mode={mode}
          onInfoClick={onInfoClick}
          onSendClick={onSendClick}
        />

        {rows[rightIndex] && (
          <NftCard
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

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id]),
    [nfts]
  );

  const creatorNfts = sortedNfts.reduce<BaseNft<any>[]>(
    (creatorNfts, current) => {
      const currentDetails = getNftDetails(current);

      if (!creatorNfts.find(nft => nft?.creator === currentDetails?.creator)) {
        creatorNfts.push(currentDetails);
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
