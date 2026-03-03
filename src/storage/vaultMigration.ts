import {
  base58Decode,
  base58Encode,
  base64Decode,
  base64Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  decryptSeed,
  encryptSeed,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import Browser from 'webextension-polyfill';

import { NetworkName } from '../networks/types';
import { type MultiWallet, type WalletItem } from '../services/types';
import { type WalletPrivateData } from '../wallets/types';

/**
 * Network code mapping for address generation
 */
const NETWORK_CODES: Record<string, string> = {
  mainnet: 'W',
  testnet: 'T',
  stagenet: 'S',
};

/**
 * Check if vault migration is needed
 */
export async function needsVaultMigration(): Promise<boolean> {
  const { needsVaultMigration: flag } = await Browser.storage.local.get(
    'needsVaultMigration',
  );
  return flag === true;
}

/**
 * Clear the migration flag after successful migration
 */
export async function clearMigrationFlag(): Promise<void> {
  await Browser.storage.local.remove(['needsVaultMigration']);
}

/**
 * Decrypt the old WalletController vault
 */
async function decryptOldVault(
  vault: string,
  password: string,
): Promise<WalletPrivateData[]> {
  try {
    const decryptedData = await decryptSeed(
      base64Decode(vault),
      utf8Encode(password),
    );
    return JSON.parse(utf8Decode(decryptedData)) as WalletPrivateData[];
  } catch {
    throw new Error('Invalid password');
  }
}

/**
 * Encrypt the new MultiWallet vault
 */
async function encryptNewVault(
  wallets: MultiWallet[],
  password: string,
): Promise<string> {
  // Remove walletInstances before serialization (they are runtime-only)
  const walletsToSerialize = wallets.map(wallet => {
    const { walletInstances, ...walletData } = wallet;
    return walletData;
  });
  const json = JSON.stringify(walletsToSerialize);
  const vault = await encryptSeed(utf8Encode(json), utf8Encode(password));
  return base64Encode(vault);
}

/**
 * Decrypt the new MultiWalletController vault
 */
async function decryptNewVault(
  vault: string,
  password: string,
): Promise<MultiWallet[]> {
  try {
    const decryptedData = await decryptSeed(
      base64Decode(vault),
      utf8Encode(password),
    );
    return JSON.parse(utf8Decode(decryptedData)) as MultiWallet[];
  } catch {
    throw new Error('Invalid password');
  }
}

/**
 * Generate a unique wallet ID
 */
function generateWalletId(): string {
  return `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate address from public key and network code
 */
function generateAddress(publicKey: Uint8Array, networkCode: string): string {
  return base58Encode(createAddress(publicKey, networkCode.charCodeAt(0)));
}

/**
 * Generate addresses for all networks from a seed
 */
async function generateNetworkAddresses(
  seed: string,
  customNetworkCode?: string,
): Promise<{
  publicKey: string;
  networks: {
    mainnet: WalletItem;
    testnet: WalletItem;
    stagenet: WalletItem;
    custom?: WalletItem;
  };
}> {
  const privateKey = await createPrivateKey(utf8Encode(seed));
  const publicKey = await createPublicKey(privateKey);
  const publicKeyBase58 = base58Encode(publicKey);

  const networks: {
    mainnet: WalletItem;
    testnet: WalletItem;
    stagenet: WalletItem;
    custom?: WalletItem;
  } = {
    mainnet: {
      address: generateAddress(publicKey, NETWORK_CODES.mainnet),
      networkCode: NETWORK_CODES.mainnet,
    },
    testnet: {
      address: generateAddress(publicKey, NETWORK_CODES.testnet),
      networkCode: NETWORK_CODES.testnet,
    },
    stagenet: {
      address: generateAddress(publicKey, NETWORK_CODES.stagenet),
      networkCode: NETWORK_CODES.stagenet,
    },
  };

  // Add custom network if configured
  if (customNetworkCode) {
    networks.custom = {
      address: generateAddress(publicKey, customNetworkCode),
      networkCode: customNetworkCode,
    };
  }

  return { publicKey: publicKeyBase58, networks };
}

/**
 * Generate addresses for all networks from a public key (for ledger/wx wallets)
 */
function generateNetworkAddressesFromPublicKey(
  publicKeyBase58: string,
  customNetworkCode?: string,
): {
  mainnet: WalletItem;
  testnet: WalletItem;
  stagenet: WalletItem;
  custom?: WalletItem;
} {
  const publicKey = base58Decode(publicKeyBase58);

  const networks: {
    mainnet: WalletItem;
    testnet: WalletItem;
    stagenet: WalletItem;
    custom?: WalletItem;
  } = {
    mainnet: {
      address: generateAddress(publicKey, NETWORK_CODES.mainnet),
      networkCode: NETWORK_CODES.mainnet,
    },
    testnet: {
      address: generateAddress(publicKey, NETWORK_CODES.testnet),
      networkCode: NETWORK_CODES.testnet,
    },
    stagenet: {
      address: generateAddress(publicKey, NETWORK_CODES.stagenet),
      networkCode: NETWORK_CODES.stagenet,
    },
  };

  // Add custom network if configured
  if (customNetworkCode) {
    networks.custom = {
      address: generateAddress(publicKey, customNetworkCode),
      networkCode: customNetworkCode,
    };
  }

  return networks;
}

/**
 * Transform a single old wallet to new MultiWallet format
 */
async function transformWallet(
  oldWallet: WalletPrivateData,
  customNetworkCode?: string,
): Promise<MultiWallet> {
  const baseWallet: Partial<MultiWallet> = {
    id: generateWalletId(),
    name: oldWallet.name,
    type: oldWallet.type,
    createdAt: Date.now(),
  };

  switch (oldWallet.type) {
    case 'seed': {
      const { publicKey, networks } = await generateNetworkAddresses(
        oldWallet.seed,
        customNetworkCode,
      );
      return {
        ...baseWallet,
        type: 'seed',
        seed: oldWallet.seed,
        coins: {
          waves: {
            publicKey,
            networks,
          },
        },
      } as MultiWallet;
    }

    case 'privateKey': {
      // For privateKey wallets, we only have the address from the old wallet
      // We need to use the existing address and public key
      return {
        ...baseWallet,
        type: 'privateKey',
        privateKey: oldWallet.privateKey,
        coins: {
          waves: {
            publicKey: oldWallet.publicKey,
            networks: generateNetworkAddressesFromPublicKey(
              oldWallet.publicKey,
              customNetworkCode,
            ),
          },
        },
      } as MultiWallet;
    }

    case 'encodedSeed': {
      // For encodedSeed wallets, use the public key to generate addresses
      return {
        ...baseWallet,
        type: 'encodedSeed',
        encodedSeed: oldWallet.encodedSeed,
        coins: {
          waves: {
            publicKey: oldWallet.publicKey,
            networks: generateNetworkAddressesFromPublicKey(
              oldWallet.publicKey,
              customNetworkCode,
            ),
          },
        },
      } as MultiWallet;
    }

    case 'ledger': {
      // Ledger wallets use public key to generate addresses
      return {
        ...baseWallet,
        type: 'ledger',
        ledgerId: oldWallet.id,
        coins: {
          waves: {
            publicKey: oldWallet.publicKey,
            networks: generateNetworkAddressesFromPublicKey(
              oldWallet.publicKey,
              customNetworkCode,
            ),
          },
        },
      } as MultiWallet;
    }

    case 'wx': {
      // WX wallets are special - they only work on ONE network (mainnet OR testnet)
      // Store the primary network so we can rollback correctly
      const networkKey =
        oldWallet.network === NetworkName.Mainnet ? 'mainnet' : 'testnet';

      // Generate addresses for all networks from public key
      const allNetworks = generateNetworkAddressesFromPublicKey(
        oldWallet.publicKey,
        customNetworkCode,
      );

      // WX wallets only have the network they were created on
      // Store only the primary network (not all networks)
      return {
        ...baseWallet,
        type: 'wx',
        wxUuid: oldWallet.uuid,
        wxUsername: oldWallet.username,
        coins: {
          waves: {
            publicKey: oldWallet.publicKey,
            networks: {
              [networkKey]: allNetworks[networkKey],
            } as {
              mainnet?: WalletItem;
              testnet?: WalletItem;
            },
          },
        },
      } as MultiWallet;
    }

    case 'debug':
    default: {
      // Debug wallets just keep the address
      // Also fallback for any unknown types
      const debugWallet = oldWallet as WalletPrivateData & {
        type: 'debug';
      };
      return {
        ...baseWallet,
        type: 'debug',
        coins: {
          waves: {
            publicKey: debugWallet.publicKey,
            networks: {
              mainnet: {
                address: debugWallet.address,
                networkCode: debugWallet.networkCode,
              },
              testnet: {
                address: debugWallet.address,
                networkCode: debugWallet.networkCode,
              },
              stagenet: {
                address: debugWallet.address,
                networkCode: debugWallet.networkCode,
              },
            },
          },
        },
      } as MultiWallet;
    }
  }
}

/**
 * Group old wallets by their seed/privateKey/publicKey to create unified MultiWallets
 * Old format had separate entries per network, new format has one entry with all networks
 */
function groupWalletsByIdentity(
  oldWallets: WalletPrivateData[],
): Map<string, WalletPrivateData[]> {
  const groups = new Map<string, WalletPrivateData[]>();

  for (const wallet of oldWallets) {
    let key: string;

    switch (wallet.type) {
      case 'seed':
        key = `seed:${wallet.seed}`;
        break;
      case 'privateKey':
        key = `privateKey:${wallet.privateKey}`;
        break;
      case 'encodedSeed':
        key = `encodedSeed:${wallet.encodedSeed}`;
        break;
      case 'ledger':
        key = `ledger:${wallet.id}:${wallet.publicKey}`;
        break;
      case 'wx':
        // WX wallets are unique per uuid
        key = `wx:${wallet.uuid}`;
        break;
      case 'debug':
      default:
        // Debug wallets are unique per address
        // Also fallback for any unknown types
        key = `debug:${
          (wallet as WalletPrivateData & { type: 'debug' }).address
        }`;
        break;
    }

    const existing = groups.get(key) || [];
    existing.push(wallet);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Deduplicate wallets by public key, keeping the highest priority wallet type
 * Priority: seed > encodedSeed > privateKey
 */
function deduplicateWalletsByPublicKey(wallets: MultiWallet[]): MultiWallet[] {
  const walletsByPublicKey = new Map<string, MultiWallet[]>();

  // Group wallets by public key
  for (const wallet of wallets) {
    const publicKey = wallet.coins.waves?.publicKey;
    if (!publicKey) continue;

    const existing = walletsByPublicKey.get(publicKey) || [];
    existing.push(wallet);
    walletsByPublicKey.set(publicKey, existing);
  }

  // For each public key, keep only the highest priority wallet
  const deduplicated: MultiWallet[] = [];

  for (const duplicates of walletsByPublicKey.values()) {
    if (duplicates.length === 1) {
      deduplicated.push(duplicates[0]);
      continue;
    }

    // Define priority order
    const typePriority: Record<string, number> = {
      seed: 1,
      encodedSeed: 2,
      privateKey: 3,
      ledger: 4,
      wx: 5,
      debug: 6,
    };

    // Sort by priority (lower number = higher priority)
    const sorted = duplicates.sort((a, b) => {
      const priorityA = typePriority[a.type] || 999;
      const priorityB = typePriority[b.type] || 999;
      return priorityA - priorityB;
    });

    // Keep the highest priority wallet
    const winner = sorted[0];

    deduplicated.push(winner);
  }

  return deduplicated;
}

/**
 * Main vault migration function
 * Called during unlock when needsVaultMigration flag is set
 * Note: The flag is only set by setVaultMigrationFlag migration when
 * oldVault exists and newVault doesn't, so we don't need to re-check here
 *
 * @returns The encrypted vault string to be set in MultiWalletController store
 */
export async function migrateVault(password: string): Promise<string> {
  // Get old vault data
  const storage = await Browser.storage.local.get([
    'WalletController',
    'MultiWalletController',
    'accounts',
    'selectedAccount',
    'customCodes',
  ]);

  const oldVault = (storage.WalletController as { vault?: string })?.vault;
  const existingNewVault = (storage.MultiWalletController as { vault?: string })
    ?.vault;

  if (!oldVault) {
    throw new Error('No vault found in storage');
  }
  // Get custom network code if configured
  const customCodes = storage.customCodes as
    | Record<NetworkName, string | null>
    | undefined;
  const customNetworkCode = customCodes?.[NetworkName.Custom] || undefined;

  // Decrypt old vault
  const oldWallets = await decryptOldVault(oldVault, password);

  // Group wallets by identity (same seed/privateKey = same MultiWallet)
  const walletGroups = groupWalletsByIdentity(oldWallets);
  // Transform each group to a MultiWallet
  const multiWalletsFromOld: MultiWallet[] = [];

  for (const [, wallets] of walletGroups) {
    // Use the first wallet in the group as the base
    // (they all have the same seed/privateKey, just different networks)
    const baseWallet = wallets[0];

    // Use the name from the first wallet, or find one with a custom name
    const walletWithName =
      wallets.find(w => w.name && w.name !== w.address) || baseWallet;

    const transformedWallet = await transformWallet(
      { ...baseWallet, name: walletWithName.name },
      customNetworkCode ?? undefined,
    );

    multiWalletsFromOld.push(transformedWallet);
  }

  // Deduplicate wallets by public key (keep highest priority: seed > encodedSeed > privateKey)
  const deduplicatedWallets =
    deduplicateWalletsByPublicKey(multiWalletsFromOld);

  // If MultiWalletController vault exists, decrypt it and merge
  let finalWallets = deduplicatedWallets;

  if (existingNewVault) {
    try {
      const existingMultiWallets = await decryptNewVault(
        existingNewVault,
        password,
      );

      // Merge: keep existing wallets + add new ones from old vault
      // Use a Map to track unique wallets by their identity
      const walletMap = new Map<string, MultiWallet>();

      // First, add all existing multi wallets
      for (const wallet of existingMultiWallets) {
        const key = getWalletIdentityKey(wallet);
        walletMap.set(key, wallet);
      }

      // Then, add wallets from old vault (only if not already present)
      for (const wallet of deduplicatedWallets) {
        const key = getWalletIdentityKey(wallet);
        if (!walletMap.has(key)) {
          walletMap.set(key, wallet);
        }
      }

      const mergedWallets = Array.from(walletMap.values());

      // Deduplicate again after merge (in case existing vault had duplicates)
      finalWallets = deduplicateWalletsByPublicKey(mergedWallets);
    } catch (error) {
      // If we can't decrypt existing vault, just use the new wallets
      finalWallets = deduplicatedWallets;
    }
  }

  // Encrypt and save new vault
  const encryptedVault = await encryptNewVault(finalWallets, password);

  // Save only the vault to storage
  // accounts and selectedAccount will be populated by MultiWalletController.unlock()
  // which emits 'multiWalletsChanged' event that triggers PreferencesController.syncAccounts()
  await Browser.storage.local.set({
    MultiWalletController: { vault: encryptedVault },
  });

  // Clear migration flag
  await clearMigrationFlag();

  // Return the encrypted vault so VaultController can update the store
  return encryptedVault;
}

/**
 * Get a unique identity key for a wallet to detect duplicates
 */
function getWalletIdentityKey(wallet: MultiWallet): string {
  switch (wallet.type) {
    case 'seed':
      return `seed:${wallet.seed}`;
    case 'privateKey':
      return `privateKey:${wallet.privateKey}`;
    case 'encodedSeed':
      return `encodedSeed:${wallet.encodedSeed}`;
    case 'ledger':
      return `ledger:${wallet.ledgerId}:${wallet.coins.waves.publicKey}`;
    case 'wx':
      return `wx:${wallet.wxUuid}`;
    case 'debug':
    default: {
      // Use public key + first network address as identity
      const firstNetwork = Object.values(wallet.coins.waves.networks)[0];
      return `debug:${wallet.coins.waves.publicKey}:${firstNetwork?.address}`;
    }
  }
}
