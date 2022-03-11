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
