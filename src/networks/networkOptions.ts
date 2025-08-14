import { BLOCKCHAIN_TYPES, NETWORK_OPTIONS, NETWORK_TYPES } from '../assets/constants';
import { NetworkName } from './types';
import { TFunction } from 'i18next';

export interface NetworkOption {
  blockchain: string;
  network: string;
  isTestnet: boolean;
  isCustom?: boolean;
  displayName: string;
  value: string; // Format: '{blockchain}-{network}'
}

/**
 * Gets formatted network display name
 */
export const getNetworkDisplayName = (
  blockchain?: string,
  network?: string,
  t?: TFunction
): string => {
  if (network === NETWORK_TYPES.CUSTOM) {
    return t ? t('networkSettings.customNetwork') : 'Custom Network';
  }

  if (!blockchain || !network) {
    return '';
  }

  const blockchainName =
    blockchain.charAt(0).toUpperCase() + blockchain.slice(1);
  const networkName = network.charAt(0).toUpperCase() + network.slice(1);
  return `${blockchainName} ${networkName}`;
};

/**
 * Returns the list of available network options
 * @param currentBlockchainType - Current blockchain type from Redux
 * @param currentNetwork - Current network from Redux
 * @param showTestAccounts - Whether to include test networks
 * @param t - Translation function (optional)
 * @returns Array of NetworkOption objects
 */
export const getAvailableNetworkOptions = (
  currentBlockchainType: string = BLOCKCHAIN_TYPES.WAVES,
  currentNetwork: string = NetworkName.Mainnet,
  showTestAccounts: boolean = true,
  t?: TFunction
): NetworkOption[] => {
  return NETWORK_OPTIONS
    .filter(option => {
      // Filter out test networks if showTestAccounts is false
      if (option.isTestnet && !showTestAccounts) {
        return false;
      }
      return true;
    })
    .map(option => ({
      ...option,
      displayName: getNetworkDisplayName(option.blockchain, option.network, t),
      value: `${option.blockchain || ''}-${option.network}`,
    })) as NetworkOption[];
};

/**
 * Checks if a network option is selected based on current state
 */
export const isNetworkSelected = (
  option: Pick<NetworkOption, 'blockchain' | 'network'>,
  currentBlockchainType: string,
  currentNetwork: string
): boolean => {
  if (!option.blockchain && option.network === NETWORK_TYPES.CUSTOM) {
    return currentNetwork === NETWORK_TYPES.CUSTOM;
  }
  return (
    option.blockchain === currentBlockchainType &&
    option.network === currentNetwork
  );
};

/**
 * Formats the combined blockchain-network value
 */
export const formatNetworkValue = (
  blockchain: string,
  network: string
): string => {
  return `${blockchain}-${network}`;
};

/**
 * Parses a combined network value into blockchain and network components
 */
export const parseNetworkValue = (
  combinedValue: string
): { blockchain: string; network: string } => {
  const [blockchain, network] = combinedValue.split('-');
  return { blockchain, network };
};
