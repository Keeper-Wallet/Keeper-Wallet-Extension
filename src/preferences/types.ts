import { WalletAccount } from 'wallets/types';

export interface IdleOptions {
  type: string;
  interval: number;
}

export type PreferencesAccount = WalletAccount & {
  lastUsed?: number;
};
