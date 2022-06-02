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
import { createNft, Nft } from 'nfts/utils';
import { DisplayMode } from 'nfts/index';

const Row = ({
  data,
  index,
  style,
}: {
  data: {
    rows: Nft[];
    counts: Record<string, number>;
    mode: DisplayMode;
    len: number;
    onInfoClick: (assetId: string) => void;
    onSendClick: (assetId: string) => void;
  };
  index: number;
  style: CSSProperties;
}) => {
  const { rows, counts = {}, mode, len, onInfoClick, onSendClick } = data;

  const leftIndex = 2 * index;
  const leftNft = rows[leftIndex];
  const leftCount = counts[leftNft?.creator] || 0;

  const rightIndex = leftIndex + 1;
  const rightNft = rows[rightIndex];
  const rightCount = counts[rightNft?.creator] || 0;

  return (
    <div style={style}>
      <div className={cn(styles.nftRow, len === 1 && styles.noScroll)}>
        <NftCard
          key={leftIndex}
          nft={leftNft}
          count={leftCount}
          mode={mode}
          onInfoClick={onInfoClick}
          onSendClick={onSendClick}
        />

        {rightNft && (
          <NftCard
            key={rightIndex}
            nft={rightNft}
            count={rightCount}
            mode={mode}
            onInfoClick={onInfoClick}
            onSendClick={onSendClick}
          />
        )}
      </div>
    </div>
  );
};

export function NftList({
  mode,
  sortedNfts,
  listRef,
  onInfoClick,
  onSendClick,
}: {
  mode: DisplayMode;
  sortedNfts: AssetDetail[];
  listRef: React.MutableRefObject<VariableSizeList>;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const nfts = useAppSelector(state => state.nfts);

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id]),
    [nfts]
  );

  let creatorNfts, creatorCounts;

  if (mode == DisplayMode.Creator) {
    [creatorNfts, creatorCounts] = sortedNfts.reduce<
      [Nft[], Record<string, number>]
    >(
      ([creatorNfts, creatorCounts], current) => {
        const currentDetails = getNftDetails(current);
        const creator = currentDetails.creator;
        if (Object.prototype.hasOwnProperty.call(creatorCounts, creator)) {
          creatorCounts[creator] += 1;
          return [creatorNfts, creatorCounts];
        }

        creatorCounts[creator] = 1;
        creatorNfts.push(currentDetails);

        return [creatorNfts, creatorCounts];
      },
      [[], {}]
    );
  } else if (mode === DisplayMode.Name) {
    creatorNfts = sortedNfts.map(getNftDetails);
    creatorCounts = {};
  }

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
                counts: creatorCounts,
                mode,
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
