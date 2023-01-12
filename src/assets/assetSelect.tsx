import { BalanceAssets } from 'balances/types';
import clsx from 'clsx';
import ColorHash from 'color-hash';
import { NetworkName } from 'networks/types';
import { useState } from 'react';
import { Modal } from 'ui/components/ui/modal/Modal';

import * as styles from './assetSelect.module.css';
import { AssetSelectModal, AssetSelectModalOption } from './selectModal';
import { useAssetLogo } from './utils';

export type AssetSelectOption = AssetSelectModalOption;

interface Props {
  assetBalances: BalanceAssets;
  network: NetworkName;
  options: AssetSelectOption[];
  value: string;
  onChange: (newValue: string) => void;
}

export function AssetSelect({
  assetBalances,
  network,
  options,
  value,
  onChange,
}: Props) {
  const logoSrc = useAssetLogo(network, value);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const asset = options.find(o => o.id === value)!;

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className={styles.button}
        type="button"
        onClick={() => {
          setShowModal(true);
        }}
      >
        {logoSrc ? (
          <img
            className={clsx(styles.logo, styles.logo_img)}
            src={logoSrc}
            alt=""
          />
        ) : (
          <div
            className={clsx(styles.logo, styles.logo_placeholder)}
            style={{
              backgroundColor: new ColorHash().hex(value),
            }}
          >
            {asset.displayName[0].toUpperCase()}
          </div>
        )}

        {asset.displayName}
      </button>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showModal}>
        <AssetSelectModal
          assetBalances={assetBalances}
          assets={options}
          network={network}
          onClose={() => {
            setShowModal(false);
          }}
          onSelect={assetId => {
            setShowModal(false);
            onChange(assetId);
          }}
        />
      </Modal>
    </>
  );
}
