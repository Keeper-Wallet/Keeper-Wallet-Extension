import { type Network, type NetworkName, type NetworkProfile } from '../networks/types';

export interface IdleOptions {
  type: string;
  interval: number;
}

export type PreferencesAccount =
  | {
      accountType: 'waves';
      id: string;
      address: string;
      name: string;
      network: NetworkProfile | NetworkName;
      networkCode: string;
      publicKey: string;
      chain: 'waves';
      type: string;
      uuid?: string;
      username?: string;
      lastUsed?: number;
    }
  | {
      accountType: 'waves';
      id: string;
      address: string;
      name: string;
      network: NetworkProfile | NetworkName;
      networkCode: string;
      publicKey: string;
      chain: 'waves';
      type: Exclude<string, 'wx'>;
      lastUsed?: number;
    }
  | {
      accountType: 'multichain';
      id: string;
      name: string;
      chain: 'all';
      network: NetworkProfile;
      lastUsed?: number;
      accounts: {
        [chain in Network]?: {
          address: string;
          publicKey: string;
        };
      };
      supportedNetworks?: {
        [network in Network]?: NetworkProfile[];
      };
      type: 'seed';
    };

export function isMultichainAccount(
  acc: PreferencesAccount,
): acc is Extract<PreferencesAccount, { accountType: 'multichain' }> {
  return acc.accountType === 'multichain';
}
