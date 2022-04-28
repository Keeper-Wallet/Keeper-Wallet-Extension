import { TRANSACTION_TYPE } from '@waves/ts-types';
import { AccountType } from 'accounts/types';
import { SeedWallet, SeedWalletInput } from './seed';
import { EncodedSeedWallet, EncodedSeedWalletInput } from './encodedSeed';
import { PrivateKeyWallet, PrivateKeyWalletInput } from './privateKey';
import { LedgerApi, LedgerWallet, LedgerWalletInput } from './ledger';
import { AssetDetail } from 'ui/services/Background';
import { WxWallet, WxWalletInput } from './wx';
import { IdentityApi } from '../controllers/IdentityController';

export function createWallet(
  input:
    | ({ type: 'seed' } & SeedWalletInput)
    | ({ type: 'encodedSeed' } & EncodedSeedWalletInput)
    | ({ type: 'privateKey' } & PrivateKeyWalletInput)
    | ({ type: 'wx' } & WxWalletInput)
    | ({ type: 'ledger' } & LedgerWalletInput),
  {
    getAssetInfo,
    identity,
    ledger,
  }: {
    getAssetInfo: (assetId: string | null) => Promise<AssetDetail>;
    identity: IdentityApi;
    ledger: LedgerApi;
  }
) {
  switch (input.type) {
    case 'seed':
      return new SeedWallet({
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
        seed: input.seed,
      });
    case 'encodedSeed':
      return new EncodedSeedWallet({
        encodedSeed: input.encodedSeed,
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
      });
    case 'privateKey':
      return new PrivateKeyWallet({
        name: input.name,
        network: input.network,
        networkCode: input.networkCode,
        privateKey: input.privateKey,
      });
    case 'wx':
      return new WxWallet(
        {
          name: input.name,
          network: input.network,
          networkCode: input.networkCode,
          publicKey: input.publicKey,
          address: input.address,
          uuid: input.uuid,
          username: input.username,
        },
        identity
      );
    case 'ledger':
      return new LedgerWallet(
        {
          address: input.address,
          id: input.id,
          name: input.name,
          network: input.network,
          networkCode: input.networkCode,
          publicKey: input.publicKey,
        },
        ledger,
        getAssetInfo
      );
    default:
      throw new Error(`Unsupported wallet type: "${(input as any).type}"`);
  }
}

export function getTxVersions(accountType: AccountType) {
  switch (accountType) {
    case 'ledger':
      return {
        [TRANSACTION_TYPE.ISSUE]: [3, 2],
        [TRANSACTION_TYPE.TRANSFER]: [2],
        [TRANSACTION_TYPE.REISSUE]: [3, 2],
        [TRANSACTION_TYPE.BURN]: [3, 2],
        [TRANSACTION_TYPE.LEASE]: [3, 2],
        [TRANSACTION_TYPE.CANCEL_LEASE]: [3, 2],
        [TRANSACTION_TYPE.ALIAS]: [3, 2],
        [TRANSACTION_TYPE.MASS_TRANSFER]: [2, 1],
        [TRANSACTION_TYPE.DATA]: [2, 1],
        [TRANSACTION_TYPE.SET_SCRIPT]: [2, 1],
        [TRANSACTION_TYPE.SPONSORSHIP]: [2, 1],
        [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: [2, 1],
        [TRANSACTION_TYPE.INVOKE_SCRIPT]: [2, 1],
        [TRANSACTION_TYPE.UPDATE_ASSET_INFO]: [1],
        1000: [1],
        1001: [1],
        1002: [3, 2, 1],
        1003: [1],
      };
    default:
      return {
        [TRANSACTION_TYPE.ISSUE]: [3, 2],
        [TRANSACTION_TYPE.TRANSFER]: [3, 2],
        [TRANSACTION_TYPE.REISSUE]: [3, 2],
        [TRANSACTION_TYPE.BURN]: [3, 2],
        [TRANSACTION_TYPE.LEASE]: [3, 2],
        [TRANSACTION_TYPE.CANCEL_LEASE]: [3, 2],
        [TRANSACTION_TYPE.ALIAS]: [3, 2],
        [TRANSACTION_TYPE.MASS_TRANSFER]: [2, 1],
        [TRANSACTION_TYPE.DATA]: [2, 1],
        [TRANSACTION_TYPE.SET_SCRIPT]: [2, 1],
        [TRANSACTION_TYPE.SPONSORSHIP]: [2, 1],
        [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: [2, 1],
        [TRANSACTION_TYPE.INVOKE_SCRIPT]: [2, 1],
        [TRANSACTION_TYPE.UPDATE_ASSET_INFO]: [1],
        1000: [1],
        1001: [1],
        1002: [3, 2, 1],
        1003: [1, 0],
      };
  }
}
