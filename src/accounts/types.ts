export type NetworkName = 'mainnet' | 'testnet' | 'stagenet' | 'custom';

export type Account = {
  address: string;
  lastUsed?: number;
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

export type AccountType = Account['type'];

export type AccountOfType<T extends AccountType> = Extract<
  Account,
  { type: T }
>;

export type KeystoreAccount = Pick<
  Account,
  'address' | 'name' | 'networkCode'
> &
  (
    | { type?: 'seed'; seed: string }
    | { type: 'encodedSeed'; encodedSeed: string }
    | { type: 'privateKey'; privateKey: string }
    | { type: 'debug' }
  );

export type KeystoreProfiles = Record<
  NetworkName,
  { accounts: KeystoreAccount[] }
>;
