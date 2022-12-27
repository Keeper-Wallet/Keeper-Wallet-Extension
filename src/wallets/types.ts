import { NetworkName } from 'networks/types';

export type CreateWalletInput = { name: string } & (
  | { type: 'debug'; address: string }
  | { type: 'encodedSeed'; encodedSeed: string }
  | { type: 'ledger'; address: string; id: number; publicKey: string }
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

export type WalletAccount = {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
} & (
  | { type: 'debug' }
  | { type: 'encodedSeed' }
  | { type: 'ledger'; id: number }
  | { type: 'privateKey' }
  | { type: 'seed' }
  | { type: 'wx'; uuid: string; username: string }
);

export type WalletPrivateData = {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
} & (
  | { type: 'debug' }
  | { type: 'encodedSeed'; encodedSeed: string }
  | { type: 'ledger'; id: number }
  | { type: 'privateKey'; privateKey: string }
  | { type: 'seed'; seed: string }
  | { type: 'wx'; uuid: string; username: string }
);

export type WalletPrivateDataOfType<T extends WalletPrivateData['type']> =
  Extract<WalletPrivateData, { type: T }>;
