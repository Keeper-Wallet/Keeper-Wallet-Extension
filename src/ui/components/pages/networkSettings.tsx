import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import background from 'ui/services/Background';
import { Button } from '../ui';
import * as styles from './networkSettings.module.css';
import { useTranslation } from 'react-i18next';
import { usePopupSelector } from 'popup/store/react';
import { useDispatch } from 'react-redux';
import { BLOCKCHAIN_TYPES, NETWORK_TYPES } from 'assets/constants';
import { ACTION } from 'store/actions/constants';
import type { NetworkName } from 'networks/types';
import { getAvailableNetworkOptions } from 'networks/networkOptions';
import { useAccountsSelector } from '../../../accounts/store/react';
import { PreferencesAccount } from '../../../preferences/types';

// Right arrow icon for the UI
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

// Toggle Switch component
const ToggleSwitch = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className={styles.toggleContainer}>
      <div className={styles.toggleLabelContainer}>
        <div className={styles.toggleLabel}>{label}</div>
        {description && (
          <div className={styles.toggleDescription}>{description}</div>
        )}
      </div>
      <label className={styles.toggleSwitch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <span className={styles.toggleSlider}></span>
      </label>
    </div>
  );
};

// Network option component
const NetworkOptionItem = ({
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
      <div className={iconClassName}>
        {hasRightArrow && (
          <div className={styles.rightArrow}>
            <RightArrowIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export function NetworkSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accounts = useAccountsSelector(state => state.accounts);

  // Get current blockchain type and network from Redux
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType || BLOCKCHAIN_TYPES.WAVES,
  );
  // Get the selected account to check if it's Waves-only
  const selectedAccount = usePopupSelector(state => state.selectedAccount);

  // State to track if the current account is Waves-only
  const [isWavesOnlyAccount, setIsWavesOnlyAccount] = useState(false);

  // Check if the account is Waves-only when component mounts or selected account changes
  useEffect(() => {
    const checkIfWavesOnly = async () => {
      try {
        // Legacy accounts are Waves-only by default
        if (!selectedAccount?.walletId) {
          setIsWavesOnlyAccount(true);
          return;
        }

        // For MultiWallet accounts, get the full wallet data from background
        // Find the wallet that matches the selected account's walletId
        const wallet = accounts.find(
          wallet =>
            (wallet as PreferencesAccount & { id: string }).id ===
            selectedAccount.walletId,
        );
        setIsWavesOnlyAccount(!!wallet?.isWavesOnly);
      } catch (error) {
        console.error('Error checking if account is Waves-only:', error);
        setIsWavesOnlyAccount(false);
      }
    };

    checkIfWavesOnly();
  }, [accounts, selectedAccount?.walletId]);

  // Initialize selectedNetwork properly based on currentNetwork format
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    // If currentNetwork is empty, use waves-mainnet
    if (!currentNetwork) {
      return 'waves-mainnet';
    }

    // If currentNetwork already has a blockchain prefix (contains a dash)
    if (currentNetwork.includes('-')) {
      return currentNetwork;
    }

    // If currentNetwork is just the network type (e.g., "mainnet")
    // Use the currentBlockchainType to create the combined format
    return `${currentBlockchainType}-${currentNetwork}`;
  });

  const [showTestAccounts, setShowTestAccounts] = useState(true);

  useEffect(() => {
    // Load the hideTestAccounts preference when component mounts
    (async () => {
      const hideTestAccountsPref = await background.getHideTestAccounts();
      setShowTestAccounts(!hideTestAccountsPref);
      // If test networks are hidden, ensure we're using mainnet
      if (hideTestAccountsPref) {
        if (
          selectedNetwork.includes('testnet') ||
          selectedNetwork.includes('stagenet')
        ) {
          // Extract the blockchain type from the current selection
          const blockchain = selectedNetwork.split('-')[0];
          setSelectedNetwork(`${blockchain}-mainnet`);
        }
      }
    })();
  }, []);

  // Handle hide test accounts toggle change
  const handleHideTestAccountsChange = async (checked: boolean) => {
    try {
      setShowTestAccounts(checked);

      // If turning off test networks, switch to mainnet if a test network is selected
      if (
        !checked &&
        (selectedNetwork.includes('testnet') ||
          selectedNetwork.includes('stagenet'))
      ) {
        // Extract the blockchain type from the current selection
        const blockchain = selectedNetwork.split('-')[0];
        setSelectedNetwork(`${blockchain}-mainnet`);
      }
    } catch (error) {
      console.error('Failed to update hide test accounts preference:', error);
    }
  };

  // Function to handle network selection
  const handleNetworkSelect = (blockchainType: string, networkType: string) => {
    setSelectedNetwork(`${blockchainType}-${networkType}`);
  };

  // Get all available network options using the shared utility and filter as needed
  const networkOptions = getAvailableNetworkOptions(
    currentBlockchainType,
    currentNetwork,
    showTestAccounts,
    t,
  ).filter(option => {
    console.log(option, 'option');
    // If it's a Waves-only account, filter out Unit0 options
    if (isWavesOnlyAccount && option.blockchain === BLOCKCHAIN_TYPES.UNIT0) {
      return false;
    }
    return true;
  });

  // Parse the selected network value
  const parseSelectedNetwork = () => {
    const [blockchain, networkType] = selectedNetwork.split('-');
    return { blockchain, networkType };
  };

  // When confirming, update both Redux values
  const handleConfirm = async () => {
    // Parse the selected network into blockchain and network type
    const { blockchain, networkType } = parseSelectedNetwork();

    // Update network in Redux - just the network type
    dispatch({
      type: ACTION.UPDATE_CURRENT_NETWORK,
      payload: networkType,
    });

    // Update blockchain type in Redux
    dispatch({
      type: ACTION.UPDATE_CURRENT_BLOCKCHAIN_TYPE,
      payload: blockchain,
    });

    // Update background settings - separately set blockchain and network type
    await background.setNetwork(networkType as NetworkName);
    await background.setCurrentBlockchainType(blockchain);
    await background.setHideTestAccounts(!showTestAccounts);

    navigate(-1);
  };

  return (
    <div className={styles.networkTab}>
      <h2 className="title1 margin-main-big">
        {t('networksSettings.network')}
      </h2>

      {/* Display Options Section */}
      <div className={styles.displayOptionsSection}>
        <ToggleSwitch
          label="Test Network Accounts"
          checked={showTestAccounts}
          onChange={handleHideTestAccountsChange}
        />
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      <div className="margin-main-big">
        {/* Network options */}
        {networkOptions.map((option, index) => {
          // Skip test networks if hidden
          if (option.isTestnet && !showTestAccounts) {
            return null;
          }

          // Add divider before first testnet option
          const showDivider =
            index > 0 &&
            option.isTestnet &&
            !networkOptions[index - 1].isTestnet;

          // Parse the currently selected network
          const {
            blockchain: selectedBlockchain,
            networkType: selectedNetwork,
          } = parseSelectedNetwork();

          // Check if this option is selected
          const isOptionSelected =
            option.blockchain === selectedBlockchain &&
            option.network === selectedNetwork;

          return (
            <div key={option.value}>
              {showDivider && <div className={styles.divider} />}
              <NetworkOptionItem
                name={
                  option.network === NETWORK_TYPES.CUSTOM
                    ? t('Custom network')
                    : option.displayName
                }
                isSelected={isOptionSelected}
                hasRightArrow={option.isCustom}
                onClick={() => {
                  if (option.isCustom) {
                    navigate('/custom-network');
                  } else if (option.blockchain) {
                    handleNetworkSelect(option.blockchain, option.network);
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      <Button
        className={styles.confirmButton}
        onClick={handleConfirm}
        type="submit"
        view="submit"
      >
        {t('networkSettings.confirm')}
      </Button>
    </div>
  );
}
