import {
    type Network,
    type NetworkInProfile,
    NetworkName,
    NetworkProfile,
} from './types';

export interface NetworkProfileConfig {
  rpcUrl: string;
  chainId: string | number;
  explorerUrl: string;
  matcherUrl?: string;
}

export interface NetworkConfig {
  network: Network;
  networkName: NetworkName;
  params: NetworkProfileConfig;
}

export interface ProfileConfig {
  profile: NetworkProfile;
  networks: NetworkInProfile[];
  configs: Record<string, NetworkConfig>;
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  'waves-mainnet': {
    network: 'waves',
    networkName: NetworkName.Mainnet,
    params: {
      rpcUrl: 'https://nodes-keeper.wavesnodes.com/',
      chainId: 'W',
      explorerUrl: 'https://wavesexplorer.com',
      matcherUrl: 'https://matcher.waves.exchange',
    },
  },
  'unit0-mainnet': {
    network: 'unit0',
    networkName: NetworkName.Mainnet,
    params: {
      rpcUrl: 'https://rpc.unit0.dev',
      chainId: 88811,
      explorerUrl: 'https://explorer.unit0.dev/',
    },
  },
  'all-mainnet': {
    network: 'waves',
    networkName: NetworkName.Mainnet,
    params: {
      rpcUrl: 'https://nodes-keeper.wavesnodes.com/',
      chainId: 'W',
      explorerUrl: 'https://wavesexplorer.com',
      matcherUrl: 'https://matcher.waves.exchange',
    },
  },
  'waves-testnet': {
    network: 'waves',
    networkName: NetworkName.Testnet,
    params: {
      rpcUrl: 'https://nodes-testnet.wavesnodes.com/',
      chainId: 'T',
      explorerUrl: 'https://testnet.wavesexplorer.com',
      matcherUrl: 'https://matcher-testnet.waves.exchange',
    },
  },
  'waves-stagenet': {
    network: 'waves',
    networkName: NetworkName.Stagenet,
    params: {
      rpcUrl: 'https://nodes-stagenet.wavesnodes.com/',
      chainId: 'S',
      explorerUrl: 'https://stagenet.wavesexplorer.com',
      matcherUrl: 'https://matcher-stagenet.waves.exchange',
    },
  },
  'unit0-testnet': {
    network: 'unit0',
    networkName: NetworkName.Testnet,
    params: {
      rpcUrl: 'https://rpc-testnet.unit0.dev',
      chainId: 88817,
      explorerUrl: 'https://explorer-testnet.unit0.dev/',
    },
  },
  'all-testnet': {
    network: 'waves',
    networkName: NetworkName.Testnet,
    params: {
      rpcUrl: 'https://nodes-testnet.wavesnodes.com/',
      chainId: 'T',
      explorerUrl: 'https://testnet.wavesexplorer.com',
      matcherUrl: 'https://matcher-testnet.waves.exchange',
    },
  },
  custom: {
    network: 'waves',
    networkName: NetworkName.Custom,
    params: {
      rpcUrl: '',
      chainId: '',
      explorerUrl: '',
      matcherUrl: '',
    },
  },
};

export const PROFILES: ProfileConfig[] = [
  {
    profile: NetworkProfile.Mainnet,
    networks: [
      {
        id: 'waves-mainnet',
        name: 'Waves',
        network: 'waves',
        networkName: NetworkName.Mainnet,
      },
      {
        id: 'unit0-mainnet',
        name: 'Unit0',
        network: 'unit0',
        networkName: NetworkName.Mainnet,
      },
      {
        id: 'all-mainnet',
        name: 'All networks',
        network: 'waves',
        networkName: NetworkName.Mainnet,
      },
    ],
    configs: {
      'waves-mainnet': NETWORK_CONFIGS['waves-mainnet'],
      'unit0-mainnet': NETWORK_CONFIGS['unit0-mainnet'],
      'all-mainnet': NETWORK_CONFIGS['all-mainnet'],
    },
  },
  {
    profile: NetworkProfile.Testnet,
    networks: [
      {
        id: 'waves-testnet',
        name: 'Waves Testnet',
        network: 'waves',
        networkName: NetworkName.Testnet,
      },
      {
        id: 'waves-stagenet',
        name: 'Waves Stagenet',
        network: 'waves',
        networkName: NetworkName.Stagenet,
      },
      {
        id: 'unit0-testnet',
        name: 'Unit0 Testnet',
        network: 'unit0',
        networkName: NetworkName.Testnet,
      },
      {
        id: 'all-testnet',
        name: 'All networks',
        network: 'waves',
        networkName: NetworkName.Testnet,
      },
      {
        id: 'custom',
        name: 'Custom',
        network: 'waves',
        networkName: NetworkName.Custom,
      },
    ],
    configs: {
      'waves-testnet': NETWORK_CONFIGS['waves-testnet'],
      'waves-stagenet': NETWORK_CONFIGS['waves-stagenet'],
      'unit0-testnet': NETWORK_CONFIGS['unit0-testnet'],
      'all-testnet': NETWORK_CONFIGS['all-testnet'],
      custom: NETWORK_CONFIGS.custom,
    },
  },
];

export const NETWORKS = [
  {
    network: 'waves' as Network,
    profiles: [
      NetworkName.Mainnet,
      NetworkName.Testnet,
      NetworkName.Stagenet,
      NetworkName.Custom,
    ],
    params: {
      [NetworkName.Mainnet]: NETWORK_CONFIGS['waves-mainnet'].params,
      [NetworkName.Testnet]: NETWORK_CONFIGS['waves-testnet'].params,
      [NetworkName.Stagenet]: NETWORK_CONFIGS['waves-stagenet'].params,
      [NetworkName.Custom]: NETWORK_CONFIGS.custom.params,
    },
  },
  {
    network: 'unit0' as Network,
    profiles: [NetworkName.Mainnet, NetworkName.Testnet],
    params: {
      [NetworkName.Mainnet]: NETWORK_CONFIGS['unit0-mainnet'].params,
      [NetworkName.Testnet]: NETWORK_CONFIGS['unit0-testnet'].params,
    },
  },
];
