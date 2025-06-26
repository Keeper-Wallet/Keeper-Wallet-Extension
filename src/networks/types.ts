export enum NetworkName {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Stagenet = 'stagenet',
  Custom = 'custom',
}

export enum NetworkProfile {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export type Network = 'waves' | 'ethereum' | 'unit0';

export interface NetworkInProfile {
  id: string;
  name: string;
  network: Network;
  networkName: NetworkName;
}

export type NetworkFilter = 'all' | Network | 'waves-testnet' | 'waves-stagenet' | 'unit0-testnet' | 'custom';

export interface NetworkFilterOption {
  value: NetworkFilter;
  label: string;
  disabled?: boolean;
}
