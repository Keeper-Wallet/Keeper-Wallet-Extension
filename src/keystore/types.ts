import { type NetworkName } from 'networks/types';

export type KeystoreAccount = {
  address: string;
  name: string;
  networkCode: string;
} & (
  | { type?: 'seed'; seed: string }
  | { type: 'encodedSeed'; encodedSeed: string }
  | { type: 'privateKey'; privateKey: string }
  | { type: 'debug' }
);

export type KeystoreProfiles = Record<
  NetworkName,
  { accounts: KeystoreAccount[] }
>;
