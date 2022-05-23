import * as React from 'react';
import { CSSProperties } from 'react';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { AssetDetail } from 'ui/services/Background';
import { DuckNft } from 'nfts/duckNft';
import * as styles from './nftsList.module.css';
import { nftCardFullHeight } from 'nfts/constants';
import cn from 'classnames';

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
  return (
    <div style={style}>
      <div className={cn(styles.nftRow, len === 1 && styles.noScroll)}>
        <DuckNft
          nft={rows[2 * index]}
          onInfoClick={onInfoClick}
          onSendClick={onSendClick}
        />
        {rows[2 * index + 1] && (
          <DuckNft
            nft={rows[2 * index + 1]}
            onInfoClick={onInfoClick}
            onSendClick={onSendClick}
          />
        )}
      </div>
    </div>
  );
};

export function NftsList({
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
