import {
  type Network as _Network,
  type NetworkProfile as _NetworkProfile,
} from 'networks/types';
export type Network = _Network;
export type NetworkProfile = _NetworkProfile;

export type CreateWavesWalletInput = {
  accountType: 'waves';
  name: string;
} & (
  | { type: 'debug'; address: string }
  | { type: 'encodedSeed'; encodedSeed: string }
  | { type: 'ledger'; address: string; id: string; publicKey: string }
  | { type: 'privateKey'; privateKey: string }
  | { type: 'seed'; seed: string }
  | {
      type: 'wx';
      address: string;
      publicKey: string;
      username: string;
      uuid: string;
    }
);

export type CreateMultichainWalletInput = {
  accountType: 'multichain';
  type: 'seed';
  seed: string;
  name: string;
  id: string;
};

export type CreateWalletInput =
  | CreateWavesWalletInput
  | CreateMultichainWalletInput;

export type WalletAccount =
  | ({
      accountType: 'waves';
      id: string;
      address: string;
      name: string;
      network: NetworkProfile;
      networkCode: string;
      publicKey: string;
      chain: 'waves';
    } & (
      | { type: 'debug' }
      | { type: 'encodedSeed' }
      | { type: 'ledger'; id: string }
      | { type: 'privateKey' }
      | { type: 'seed' }
      | { type: 'wx'; uuid: string; username: string }
    ))
  | {
      accountType: 'multichain';
      id: string;
      name: string;
      supportedNetworks?: {
        [network in Network]?: NetworkProfile[];
      };
      accounts: {
        [chain: string]: {
          address: string;
          publicKey: string;
        };
      };
    };

export type WalletPrivateData =
  | ({
      accountType: 'waves';
      id: string;
      address: string;
      name: string;
      network: NetworkProfile;
      networkCode: string;
      publicKey: string;
    } & (
      | { type: 'debug' }
      | { type: 'encodedSeed'; encodedSeed: string }
      | { type: 'ledger'; id: string }
      | { type: 'privateKey'; privateKey: string }
      | { type: 'seed'; seed: string }
      | { type: 'wx'; uuid: string; username: string }
    ))
  | {
      accountType: 'multichain';
      id: string;
      name: string;
      seed: string;
      accounts: {
        [chain: string]: {
          address: string;
          publicKey: string;
        };
      };
      type: 'seed';
    };

export type WalletPrivateDataOfType<T extends WalletPrivateData['type']> =
  Extract<WalletPrivateData, { accountType: 'waves'; type: T }>;
