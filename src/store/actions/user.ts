import { type CreateWalletInput } from 'wallets/types';

import { type AccountsThunkAction } from '../../accounts/store/types';
import { NETWORK_CONFIG } from '../../constants';
import { NetworkName } from '../../networks/types';
import { type PreferencesAccount } from '../../preferences/types';
import { NETWORK_CODES } from '../../services/types';
import { type MultiWallet } from '../../services/types';
import Background, { WalletTypes } from '../../ui/services/Background';
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
    | { type: 'debug'; address: string }
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

    dispatch(
      selectAccount(
        await Background.addWallet(account, currentNetwork, networkCode),
      ),
    );

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
  mainnetAddress,
  publicKey,
  testnetAddress,
  stagenetAddress,
  privateKey,
  type,
}: {
  name: string;
  seed?: string;
  mainnetAddress: string;
  publicKey: string;
  testnetAddress: string;
  stagenetAddress: string;
  privateKey?: string;
  type: string;
}): AccountsThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const multiWallet: MultiWallet = {
      id: Date.now().toString(), // Generate unique ID
      name,
      type,
      createdAt: Date.now(),
      seed,
      privateKey,

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
      },
    };
    const wallet = await Background.addMultiWallet(multiWallet);

    // Manually trigger account sync to ensure immediate availability
    const allMultiWallets = await Background.getMultiWallets();
    await Background.syncAccountsFromMultiWallets(allMultiWallets);

    // Get current network from Redux state
    const currentNetwork = getState().currentNetwork;

    // Use address from current network instead of hardcoded mainnet
    const selectedAddress =
      wallet.coins.waves.networks[currentNetwork]?.address ||
      wallet.coins.waves.networks.mainnet.address;

    // Retry mechanism to handle potential timing issues
    let selectedAccount;
    for (let attempt = 0; attempt < 3; attempt++) {
      const accounts = await Background.getLegacyFormatAccounts();
      selectedAccount = accounts.find(
        account => account.address === selectedAddress,
      );

      if (selectedAccount) break;

      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!selectedAccount) {
      throw new Error(
        `No account found with address: ${selectedAddress} after 3 attempts`,
      );
    }

    dispatch(selectAccount(selectedAccount as PreferencesAccount));
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

    // Manually trigger account sync to ensure immediate availability
    const allMultiWallets = await Background.getMultiWallets();
    await Background.syncAccountsFromMultiWallets(allMultiWallets);

    // Get current network from Redux state
    const currentNetwork = getState().currentNetwork;

    // Use address from current network instead of hardcoded mainnet
    const selectedAddress =
      wallet.coins.waves.networks[currentNetwork]?.address ||
      wallet.coins.waves.networks.mainnet.address;

    // Retry mechanism to handle potential timing issues
    let selectedAccount;
    for (let attempt = 0; attempt < 3; attempt++) {
      const accounts = await Background.getLegacyFormatAccounts();
      selectedAccount = accounts.find(
        account => account.address === selectedAddress,
      );

      if (selectedAccount) break;

      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!selectedAccount) {
      throw new Error(
        `No account found with address: ${selectedAddress} after 3 attempts`,
      );
    }

    dispatch(selectAccount(selectedAccount as PreferencesAccount));
  };
}
