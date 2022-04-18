import { NetworkName } from 'accounts/types';
import ColorHash from 'color-hash';
import * as React from 'react';
import { Modal } from 'ui/components/ui/modal/Modal';
import { BalanceAssets } from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import * as styles from './assetSelect.module.css';
import { AssetSelectModal } from './selectModal';
import { getAssetLogo } from './utils';

interface Props {
  assetBalances: BalanceAssets;
  network: NetworkName;
  options: AssetDetail[];
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
  const logoSrc = getAssetLogo(network, value);
  const asset = options.find(o => o.id === value);

  const [showModal, setShowModal] = React.useState(false);

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
          <img className={styles.logoImg} src={logoSrc} alt="" />
        ) : (
          <div
            className={styles.logoPlaceholder}
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
