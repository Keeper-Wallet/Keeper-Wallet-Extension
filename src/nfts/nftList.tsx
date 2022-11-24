import cn from 'classnames';
import { nftRowFullHeight } from 'nfts/constants';
import { BaseInfo, BaseNft, DisplayMode } from 'nfts/index';
import { NftCard } from 'nfts/nftCard';
import { Nft } from 'nfts/utils';
import { CSSProperties } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList } from 'react-window';

import { Duckling } from './ducklings';
import * as styles from './nftList.module.css';

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
    renderMore: () => void;
  };
  index: number;
  style: CSSProperties;
}) => {
  const { rows, counts = {}, mode, len, onClick, renderMore } = data;

  const leftIndex = 2 * index;
  const leftNft = rows[leftIndex];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const leftCount = counts[leftNft?.creator!] || 0;

  const rightIndex = leftIndex + 1;
  const rightNft = rows[rightIndex];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const rightCount = counts[rightNft?.creator!] || 0;

  return (
    <div style={style}>
      <div className={cn(styles.nftRow, len === 1 && styles.noScroll)}>
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
  nfts: Array<Duckling | BaseNft<BaseInfo>>;
  counters?: Record<string, number>;
  onClick: (nft: Nft) => void;
  renderMore?: () => void;
}) {
  return (
    <div className={styles.nftList}>
      <AutoSizer>
        {({ height, width }) => {
          const len = Math.round(nfts.length / 2);
          return (
            <VariableSizeList
              height={height}
              width={width}
              itemCount={len}
              itemSize={() => nftRowFullHeight}
              itemData={{
                rows: nfts,
                counts: counters,
                mode,
                len,
                onClick,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                renderMore: renderMore as any,
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
