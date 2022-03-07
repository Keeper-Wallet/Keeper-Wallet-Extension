export type AccountType = 'seed' | 'encodedSeed' | 'privateKey' | 'ledger';
export type NetworkName = 'mainnet' | 'testnet' | 'stagenet' | 'custom';

export interface Account {
  address: string;
  lastUsed?: number;
  name: string;
  network: NetworkName;
  networkCode: string;
  publicKey: string;
  type: AccountType;
}

export type KeystoreAccount = Pick<
  Account,
  'address' | 'name' | 'networkCode'
> &
  (
    | { type?: 'seed'; seed: string }
    | { type: 'encodedSeed'; encodedSeed: string }
    | { type: 'privateKey'; privateKey: string }
  );

export type KeystoreProfiles = Record<
  NetworkName,
  { accounts: KeystoreAccount[] }
>;
