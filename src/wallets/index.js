import { SeedWallet } from './seed';
import { LedgerWallet } from './ledger';
import { TrezorWallet } from './trezor';

export const WALLET_MAP = {
  ledger: LedgerWallet,
  trezor: TrezorWallet,
  seed: SeedWallet,
};
