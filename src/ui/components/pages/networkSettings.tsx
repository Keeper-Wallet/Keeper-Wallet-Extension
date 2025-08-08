import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
// import { NetworkId } from 'networks/types';
// import { NETWORK_IDS } from 'networks/constants';
import background from 'ui/services/Background';

import { Button } from '../ui';
import * as styles from './networkSettings.module.css';
import { useTranslation } from 'react-i18next';
import { usePopupSelector } from '../../../popup/store/react';

const RightArrowIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 6L15 12L9 18"
      stroke="#9E9E9E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Network option component
const NetworkOption = ({
  name,
  isSelected,
  hasRightArrow = false,
  onClick,
}: {
  name: string;
  isSelected?: boolean;
  hasRightArrow?: boolean;
  onClick: () => void;
}) => {
  const optionClassName = clsx(styles.networkOption, {
    [styles.selected]: isSelected,
  });

  const iconClassName = clsx(styles.selectionIndicator, {
    'selected-network': isSelected,
  });

  return (
    <div className={optionClassName} onClick={onClick}>
      <div className={styles.networkName}>{name}</div>
      <div className={iconClassName} />
      {hasRightArrow && (
        <div className={styles.rightArrow}>
          <RightArrowIcon />
        </div>
      )}
    </div>
  );
};
const NETWORK_IDS = {};

interface NetworkId {}

export function NetworkSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for the selected network
  const currentNetwork = usePopupSelector(state => {
    return state.currentNetwork;
  });

  console.log(currentNetwork, '####');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>();
  useEffect(() => {
    setSelectedNetwork(currentNetwork);
  }, []);

  const handleConfirm = () => {
    // Update the network in the controller
    if (selectedNetwork) {
      background.setNetwork(selectedNetwork);
    }
    // Go back to the previous screen
    navigate(-1);
  };

  return (
    <div className={styles.networkTab}>
      <h2 className="title1 margin-main-big">
        {t('networksSettings.network')}
      </h2>

      <div className="margin-main-big">
        {/* Mainnet section */}
        <NetworkOption
          name="Waves Mainnet"
          isSelected={selectedNetwork === NETWORK_IDS.WAVES_MAINNET}
          onClick={() => setSelectedNetwork(NETWORK_IDS.WAVES_MAINNET)}
        />
        <NetworkOption
          name="Unit0 Mainnet"
          isSelected={selectedNetwork === NETWORK_IDS.UNIT0_MAINNET}
          onClick={() => setSelectedNetwork(NETWORK_IDS.UNIT0_MAINNET)}
        />

        {/* Divider */}
        <div className={styles.divider} />

        {/* Testnet section */}
        <NetworkOption
          name="Waves Testnet"
          isSelected={selectedNetwork === NETWORK_IDS.WAVES_TESTNET}
          onClick={() => setSelectedNetwork(NETWORK_IDS.WAVES_TESTNET)}
        />
        <NetworkOption
          name="Unit0 Testnet"
          isSelected={selectedNetwork === NETWORK_IDS.UNIT0_TESTNET}
          onClick={() => setSelectedNetwork(NETWORK_IDS.UNIT0_TESTNET)}
        />

        {/* Divider */}
        <div className={styles.divider} />

        {/* Stagenet section */}
        <NetworkOption
          name="Waves Stagenet"
          isSelected={selectedNetwork === NETWORK_IDS.WAVES_STAGENET}
          onClick={() => setSelectedNetwork(NETWORK_IDS.WAVES_STAGENET)}
        />

        {/* Divider */}
        <div className={styles.divider} />

        {/* Custom network */}
        <NetworkOption
          name="Custom network"
          hasRightArrow={true}
          onClick={() => {
            setSelectedNetwork(NETWORK_IDS.CUSTOM);
            navigate('/custom-network');
          }}
        />
      </div>

      <Button
        className={styles.confirmButton}
        onClick={handleConfirm}
        type="submit"
        view="submit"
      >
        Confirm
      </Button>
    </div>
  );
}
