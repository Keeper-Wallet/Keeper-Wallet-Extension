import { type AccountsThunkAction } from '../../accounts/store/types';
import { NETWORK_CONFIG } from '../../constants';
import { NetworkName } from '../../networks/types';
import { type PreferencesAccount } from '../../preferences/types';
import { type MultiWallet, NETWORK_CODES } from '../../services/types';
import Background, { WalletTypes } from '../../ui/services/Background';
import { type CreateWalletInput } from '../../wallets/types';
import { WalletFactory } from '../../controllers/multiwallet/factory/WalletFactory';
import { ACTION } from './constants';
import { selectAccount } from './localState';
import { updateActiveState } from './notifications';
export function deleteAllAccounts(): AccountsThunkAction<Promise<void>> {
  return async dispatch => {
    await Background.deleteVault();

    dispatch(updateActiveState());
  };
}

export function createAccount(
  account: { name: string } & (
    | { type: 'debug'; address: string; unit0Address?: string }
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
  ),
  type: WalletTypes,
): AccountsThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNetwork, customCodes } = getState();

    const networkCode =
      customCodes[currentNetwork] || NETWORK_CONFIG[currentNetwork].networkCode;

    if (type === WalletTypes.Debug && account.type === 'debug') {
      const factory = new WalletFactory();

      const blockchains: Array<'waves' | 'unit0'> = ['waves'];
      const networks: Partial<Record<'waves' | 'unit0', NetworkName[]>> = {
        waves: [NetworkName.Mainnet, NetworkName.Testnet, NetworkName.Stagenet],
      };

      if (account.unit0Address) {
        blockchains.push('unit0');
        networks.unit0 = [NetworkName.Mainnet, NetworkName.Testnet];
      }

      const input = {
        name: account.name,
        type: 'debug' as const,
        address: account.address,
        unit0Address: account.unit0Address,
        blockchains,
        networks,
      };

      const result = await factory.createWallet(input);

      if (!result.success || !result.wallet) {
        throw result.error || new Error('Failed to create debug MultiWallet');
      }

      const wallet = await Background.addMultiWallet(result.wallet);

      const selectedAddress = wallet.coins.waves?.networks.mainnet?.address;
      if (!selectedAddress) {
        throw new Error('No address found in created debug MultiWallet');
      }

      const selectedAccount = {
        address: selectedAddress,
        name: wallet.name,
        network: 'mainnet' as const,
        networkCode: 'W',
        publicKey: wallet.coins.waves?.publicKey || '',
        type: 'debug' as const,
        walletId: wallet.id,
        coinType: 'waves',
      };

      dispatch(selectAccount(selectedAccount as unknown as PreferencesAccount));
    } else {
      const createdAccount = await Background.addWallet(
        account,
        currentNetwork,
        networkCode,
      );
      dispatch(selectAccount(createdAccount));
    }

    if (type !== WalletTypes.Debug) {
      await Background.track({ eventType: 'addWallet', type });
    }
  };
}

export function batchAddAccounts(
  accounts: Array<
    CreateWalletInput & { network: NetworkName; networkCode: string }
  >,
  type: WalletTypes,
): AccountsThunkAction<Promise<void>> {
  return async () => {
    await Background.batchAddWallets(accounts);

    if (type !== WalletTypes.Debug) {
      await Background.track({ eventType: 'addWallet', type });
    }
  };
}

export const setLocale = (locale: string) => ({
  type: ACTION.CHANGE_LNG,
  payload: locale,
});

export const changePassword = (oldPassword: string, newPassword: string) => ({
  type: ACTION.CHANGE_PASSWORD,
  payload: { oldPassword, newPassword },
});

/**
 * Creates a Waves-only MultiWallet with addresses for all networks (mainnet, testnet, stagenet)
 * using the AccountService directly rather than the legacy account creation flow
 */
export function createWavesOnlyMultiWallet({
  name,
  seed,
  privateKey,
  encodedSeed,
  ledgerId,
  publicKey,
  address,
  uuid,
  username,
  type,
}: {
  name: string;
  seed?: string;
  privateKey?: string;
  encodedSeed?: string;
  ledgerId?: number;
  publicKey?: string;
  address?: string;
  uuid?: string;
  username?: string;
  type: string;
}): AccountsThunkAction<Promise<void>> {
  return async dispatch => {
    // Create Waves-only wallet using our factory
    const factory = new WalletFactory();

    // Create appropriate input based on type
    let result;
    if (type === 'privateKey' && privateKey) {
      const input = {
        name,
        type: 'privateKey' as const,
        privateKey,
        blockchains: ['waves'] as Array<'waves'>,
        networks: {
          waves: [
            NetworkName.Mainnet,
            NetworkName.Testnet,
            NetworkName.Stagenet,
          ],
        },
      };
      result = await factory.createWallet(input);
    } else if (type === 'encodedSeed' && encodedSeed) {
      const input = {
        name,
        type: 'encodedSeed' as const,
        encodedSeed,
        blockchains: ['waves'] as Array<'waves'>,
        networks: {
          waves: [
            NetworkName.Mainnet,
            NetworkName.Testnet,
            NetworkName.Stagenet,
          ],
        },
      };
      result = await factory.createWallet(input);
    } else if (
      type === 'ledger' &&
      ledgerId !== undefined &&
      publicKey &&
      address
    ) {
      const input = {
        name,
        type: 'ledger' as const,
        id: ledgerId,
        publicKey,
        address,
        blockchains: ['waves'] as Array<'waves'>,
        networks: {
          waves: [
            NetworkName.Mainnet,
            NetworkName.Testnet,
            NetworkName.Stagenet,
          ],
        },
      };
      result = await factory.createWallet(input);
    } else {
      const input = {
        name,
        type: type as any,
        ...(type === 'seed'
          ? { seed: seed || '' }
          : type === 'privateKey'
          ? { privateKey: privateKey || '' }
          : type === 'encodedSeed'
          ? { encodedSeed: encodedSeed || '' }
          : type === 'ledger'
          ? { ledgerId: ledgerId || 0, address: address || '' }
          : type === 'wx'
          ? { uuid: uuid, username: username, address: address || '' }
          : { seed: seed || '' }),
        blockchains: ['waves'] as Array<'waves'>,
        networks: {
          waves: [
            NetworkName.Mainnet,
            NetworkName.Testnet,
            NetworkName.Stagenet,
          ],
        },
      };
      result = await factory.createWallet(input);
    }

    if (!result.success || !result.wallet) {
      throw result.error || new Error('Failed to create Waves-only wallet');
    }

    const wallet = await Background.addMultiWallet(result.wallet);

    // For Waves-only wallet, create account directly from wallet data (bypass legacy sync)
    const selectedAddress =
      wallet.coins.waves?.networks.mainnet?.address ||
      wallet.coins.waves?.networks.testnet?.address ||
      wallet.coins.waves?.networks.stagenet?.address ||
      '';

    if (!selectedAddress) {
      throw new Error('No address found in created Waves-only wallet');
    }

    // Create account object directly from wallet data (bypass problematic legacy sync)
    let selectedAccount: any;

    if (wallet.type === 'ledger' && (wallet as any).ledgerId !== undefined) {
      // Ledger account with proper discriminated union type
      selectedAccount = {
        address: selectedAddress,
        name: wallet.name,
        network: 'mainnet' as const,
        networkCode: 'W',
        publicKey: wallet.coins.waves?.publicKey || '',
        type: 'ledger' as const,
        id: (wallet as any).ledgerId, // id is part of the ledger type
      };
    } else if (
      wallet.type === 'wx' &&
      (wallet as any).wxUuid &&
      (wallet as any).wxUsername
    ) {
      // WX account with uuid and username
      selectedAccount = {
        address: selectedAddress,
        name: wallet.name,
        network: 'mainnet' as const,
        networkCode: 'W',
        publicKey: wallet.coins.waves?.publicKey || '',
        type: 'wx' as const,
        uuid: wallet.wxUuid,
        username: wallet.wxUsername,
      };
    } else {
      // Other wallet types (seed, privateKey, encodedSeed, debug)
      selectedAccount = {
        address: selectedAddress,
        name: wallet.name,
        network: 'mainnet' as const,
        networkCode: 'W',
        publicKey: wallet.coins.waves?.publicKey || '',
        type: wallet.type,
      };
    }

    dispatch(selectAccount(selectedAccount as PreferencesAccount));
  };
}

/**
 * NEW: Creates a MultiWallet using the factory system
{{ ... }}
 * Uses our Strategy + Factory pattern for reliable multi-blockchain wallet creation
 */

export function createMultiWalletWithFactory({
  name,
  seed,
}: {
  name: string;
  seed: string;
}): AccountsThunkAction<Promise<void>> {
  return async dispatch => {
    // Create wallet using our factory
    const factory = new WalletFactory();

    const input = {
      name,
      type: 'seed' as const,
      seed,
      blockchains: ['waves', 'unit0'] as Array<'waves' | 'unit0'>,
      networks: {
        waves: [NetworkName.Mainnet, NetworkName.Testnet, NetworkName.Stagenet],
        unit0: [NetworkName.Mainnet, NetworkName.Testnet],
      },
    };

    const result = await factory.createWallet(input);

    if (!result.success || !result.wallet) {
      throw result.error || new Error('Failed to create multichain wallet');
    }

    const wallet = await Background.addMultiWallet(result.wallet);

    let selectedAddress = '';
    let networkCode = '';
    let network: NetworkName = NetworkName.Mainnet;
    let publicKey = '';
    let coinType: PreferencesAccount['coinType'];

    // Prefer Waves addresses from the newly created wallet
    if (wallet.coins.waves) {
      const wavesNetworks = wallet.coins.waves.networks;

      if (wavesNetworks.mainnet?.address) {
        selectedAddress = wavesNetworks.mainnet.address;
        networkCode = wavesNetworks.mainnet.networkCode;
        network = NetworkName.Mainnet;
      } else if (wavesNetworks.testnet?.address) {
        selectedAddress = wavesNetworks.testnet.address;
        networkCode = wavesNetworks.testnet.networkCode;
        network = NetworkName.Testnet;
      } else if (wavesNetworks.stagenet?.address) {
        selectedAddress = wavesNetworks.stagenet.address;
        networkCode = wavesNetworks.stagenet.networkCode;
        network = NetworkName.Stagenet;
      }

      publicKey = wallet.coins.waves.publicKey || '';
      coinType = 'waves';
    }

    if (!selectedAddress) {
      throw new Error('No address found in created wallet for selection');
    }

    const selectedAccount: PreferencesAccount = {
      address: selectedAddress,
      name: wallet.name,
      network,
      networkCode,
      publicKey,
      // Mark this as a multichain PreferencesAccount
      type: 'multichain',
      walletId: wallet.id,
      coinType,
    };

    dispatch(selectAccount(selectedAccount));
  };
}

/**
 * Creates a Full MultiWallet with addresses for both Waves networks (mainnet, testnet, stagenet)
 * and Unit0 networks (mainnet, testnet) using simplified arguments
 */
export function createFullMultiWallet({
  name,
  seed,
  mainnetAddress,
  publicKey,
  testnetAddress,
  stagenetAddress,
  unit0Address,
  unit0PublicKey,
  type,
}: {
  name: string;
  seed: string;
  mainnetAddress: string;
  publicKey: string;
  testnetAddress: string;
  stagenetAddress: string;
  unit0Address: string;
  unit0PublicKey: string;
  type: string;
}): AccountsThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const multiWallet: MultiWallet = {
      id: Date.now().toString(), // Generate unique ID
      name,
      type,
      createdAt: Date.now(),
      seed,

      coins: {
        waves: {
          publicKey,
          networks: {
            mainnet: {
              address: mainnetAddress,
              networkCode: NETWORK_CONFIG[NetworkName.Mainnet].networkCode,
            },
            testnet: {
              address: testnetAddress,
              networkCode: NETWORK_CONFIG[NetworkName.Testnet].networkCode,
            },
            stagenet: {
              address: stagenetAddress,
              networkCode: NETWORK_CONFIG[NetworkName.Stagenet].networkCode,
            },
          },
        },
        unit0: {
          publicKey: unit0PublicKey,
          networks: {
            mainnet: {
              address: unit0Address,
              networkCode: NETWORK_CODES.unit0.mainnet,
            },
            testnet: {
              address: unit0Address, // For now using same address for both networks
              networkCode: NETWORK_CODES.unit0.testnet,
            },
          },
        },
      },
    };

    const wallet = await Background.addMultiWallet(multiWallet);

    // Get current network from Redux state
    const currentNetwork = getState().currentNetwork as NetworkName;

    // Determine which Waves address to select based on current network
    let selectedAddress = '';
    let network: NetworkName = NetworkName.Mainnet;
    let networkCode = '';
    const wavesNetworks = wallet.coins.waves.networks;

    if (currentNetwork === NetworkName.Mainnet && wavesNetworks.mainnet?.address) {
      selectedAddress = wavesNetworks.mainnet.address;
      networkCode = wavesNetworks.mainnet.networkCode;
      network = NetworkName.Mainnet;
    } else if (
      currentNetwork === NetworkName.Testnet &&
      wavesNetworks.testnet?.address
    ) {
      selectedAddress = wavesNetworks.testnet.address;
      networkCode = wavesNetworks.testnet.networkCode;
      network = NetworkName.Testnet;
    } else if (
      currentNetwork === NetworkName.Stagenet &&
      wavesNetworks.stagenet?.address
    ) {
      selectedAddress = wavesNetworks.stagenet.address;
      networkCode = wavesNetworks.stagenet.networkCode;
      network = NetworkName.Stagenet;
    } else if (wavesNetworks.mainnet?.address) {
      // Fallback to mainnet if current network not available
      selectedAddress = wavesNetworks.mainnet.address;
      networkCode = wavesNetworks.mainnet.networkCode;
      network = NetworkName.Mainnet;
    }

    const wavesPublicKey = wallet.coins.waves.publicKey || '';

    if (!selectedAddress) {
      throw new Error('No address found in created wallet for selection');
    }

    const selectedAccount: PreferencesAccount = {
      address: selectedAddress,
      name: wallet.name,
      network,
      networkCode,
      publicKey: wavesPublicKey,
      type: 'multichain',
      walletId: wallet.id,
      coinType: 'waves',
    };

    dispatch(selectAccount(selectedAccount));
  };
}
