import clsx from 'clsx';
import { type CSSProperties } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList } from 'react-window';
import invariant from 'tiny-invariant';

import { NftCard } from './nftCard';
import * as styles from './nftList.module.css';
import { type DisplayMode, type Nft } from './types';

const NFT_ROW_HEIGHT = 162;
const NFT_ROW_MARGIN_BOTTOM = 8;
const NFT_ROW_FULL_HEIGHT = NFT_ROW_HEIGHT + NFT_ROW_MARGIN_BOTTOM;

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
    onClick: (nft: Nft) => void;
    renderMore?: () => React.ReactNode;
  };
  index: number;
  style: CSSProperties;
}) => {
  const { rows, counts = {}, mode, len, onClick, renderMore } = data;

  const leftIndex = 2 * index;
  const leftNft = rows[leftIndex];
  const leftCount = (leftNft?.creator && counts[leftNft.creator]) || 0;

  const rightIndex = leftIndex + 1;
  const rightNft = rows[rightIndex];
  const rightCount = (rightNft?.creator && counts[rightNft.creator]) || 0;

  return (
    <div style={style}>
      <div className={clsx(styles.nftRow, len === 1 && styles.noScroll)}>
        <NftCard
          key={leftIndex}
          nft={leftNft}
          count={leftCount}
          mode={mode}
          onClick={() => onClick(leftNft)}
        />

        {rightNft && (
          <NftCard
            key={rightIndex}
            nft={rightNft}
            count={rightCount}
            mode={mode}
            onClick={() => onClick(rightNft)}
          />
        )}
      </div>

      {typeof renderMore === 'function' && index === len - 1 && renderMore()}
    </div>
  );
};

export function NftList({
  mode,
  nfts,
  counters = {},
  onClick,
  renderMore,
}: {
  mode: DisplayMode;
  nfts: Nft[];
  counters?: Record<string, number>;
  onClick: (nft: Nft) => void;
  renderMore?: () => React.ReactNode;
}) {
  return (
    <div className={styles.nftList}>
      <AutoSizer>
        {({ height, width }) => {
          invariant(width != null);
          invariant(height != null);

          const len = Math.round(nfts.length / 2);
          return (
            <VariableSizeList
              height={height}
              width={width}
              itemCount={len}
              itemSize={() => NFT_ROW_FULL_HEIGHT}
              itemData={{
                rows: nfts,
                counts: counters,
                mode,
                len,
                onClick,
                renderMore,
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
