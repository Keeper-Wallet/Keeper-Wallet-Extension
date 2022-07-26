import { NetworkName } from 'networks/types';
import type { DebugWalletInput } from './debug';
import type { EncodedSeedWalletInput } from './encodedSeed';
import type { LedgerWalletInput } from './ledger';
import type { PrivateKeyWalletInput } from './privateKey';
import type { SeedWalletInput } from './seed';
import type { WxWalletInput } from './wx';

export type CreateWalletInput =
  | ({ type: 'seed' } & SeedWalletInput)
  | ({ type: 'encodedSeed' } & EncodedSeedWalletInput)
  | ({ type: 'privateKey' } & PrivateKeyWalletInput)
  | ({ type: 'wx' } & WxWalletInput)
  | ({ type: 'ledger' } & LedgerWalletInput)
  | ({ type: 'debug' } & DebugWalletInput);

export type WalletAccount = {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
} & (
  | { type: 'seed' }
  | { type: 'encodedSeed' }
  | { type: 'privateKey' }
  | { type: 'ledger'; id: number }
  | { type: 'wx'; uuid: string; username: string }
  | { type: 'debug' }
);

export type WalletPrivateData = {
  address: string;
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
} & (
  | { type: 'seed'; seed: string }
  | { type: 'encodedSeed'; encodedSeed: string }
  | { type: 'privateKey'; privateKey: string }
  | { type: 'ledger'; id: number }
  | { type: 'wx'; uuid: string; username: string }
  | { type: 'debug' }
);

export type WalletPrivateDataOfType<T extends WalletPrivateData['type']> =
  Extract<WalletPrivateData, { type: T }>;
