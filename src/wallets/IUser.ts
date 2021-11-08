export interface IUser {
  id?: string;
  seed?: string;
  address: string;
  publicKey: string;
  type: 'ledger' | 'seed';
}
