import { Asset } from '@waves/data-entities';
import ColorHash from 'color-hash';
import * as React from 'react';
import * as styles from './assetLogo.module.css';
import { getAssetLogo } from './utils';

interface Props {
  asset: Asset;
  network: string;
}

export function SwapAssetLogo({ asset, network }: Props) {
  const logoSrc = getAssetLogo(network, asset.id);

  return (
    <div className={styles.root}>
      {logoSrc ? (
        <img className={styles.img} src={logoSrc} alt="" />
      ) : (
        <div
          className={styles.placeholder}
          style={{
            backgroundColor: new ColorHash().hex(asset.id),
          }}
        >
          {asset.displayName[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}
