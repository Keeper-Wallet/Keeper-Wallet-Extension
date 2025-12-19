import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { type ExtensionStorage } from '../storage/storage';
import { migrateVault } from '../storage/vaultMigration';
import { type IdentityController } from './IdentityController';
import { type MultiWalletController } from './MultiWalletController';
import { type WalletController } from './wallet';

export class VaultController {
  #identity;
  #wallet;
  #oldWallet;

  store;

  constructor({
    extensionStorage,
    wallet,
    oldWallet,
    identity,
  }: {
    extensionStorage: ExtensionStorage;
    wallet: MultiWalletController;
    oldWallet: WalletController;
    identity: IdentityController;
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ locked: false, initialized: false }),
    );

    extensionStorage.subscribe(this.store);

    this.#identity = identity;
    this.#wallet = wallet;
    this.#oldWallet = oldWallet;

    // Check both new and old vault for initialized state (for migration support)
    const hasNewVault = Boolean(
      wallet.store.getState().MultiWalletController?.vault,
    );
    const hasOldVault = Boolean(
      oldWallet.store.getState().WalletController?.vault,
    );

    this.store.updateState({
      initialized: hasNewVault || hasOldVault,
      locked: !extensionStorage.getInitSession().password,
    });
  }

  async init(password: string) {
    await this.#wallet.initVault(password);
    this.#identity.initVault(password);
    this.store.updateState({ initialized: true, locked: false });
  }

  lock() {
    this.#wallet.lock();
    this.#identity.lock();
    this.store.updateState({ locked: true });
  }

  async unlock(password: string) {
    // Get migration version from storage (persists through extensionStorage.clear())
    const { migrationVersion = 0 } =
      await Browser.storage.local.get('migrationVersion');

    // Check vault states
    const hasOldVault = Boolean(
      this.#oldWallet.store.getState().WalletController?.vault,
    );
    const hasNewVault = Boolean(
      this.#wallet.store.getState().MultiWalletController?.vault,
    );

    // Forward migration: version >= 4 AND old vault exists AND new vault doesn't
    const migrationNeeded =
      migrationVersion >= 4 && hasOldVault && !hasNewVault;

    if (migrationNeeded) {
      const encryptedVault = await migrateVault(password);

      // Update MultiWalletController store with the new vault
      // This is necessary because the store state is stale after migration
      this.#wallet.store.updateState({
        MultiWalletController: { vault: encryptedVault },
      });
    }

    await this.#wallet.unlock(password);
    this.#identity.unlock(password);
    this.store.updateState({ locked: false });
  }

  async update(oldPassword: string, newPassword: string) {
    await Promise.all([
      this.#wallet.newPassword(oldPassword, newPassword),
      this.#identity.updateVault(oldPassword, newPassword),
    ]);
  }

  async clear() {
    await this.#wallet.deleteVault();
    this.#identity.deleteVault();
    this.store.updateState({ initialized: false, locked: true });
  }

  isLocked() {
    return this.store.getState().locked;
  }

  migrate() {
    const state = this.#wallet.store.getState().MultiWalletController;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((state as any).initialized != null) {
      this.store.updateState({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialized: (state as any).initialized,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).locked;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).initialized;

      this.#wallet.store.putState({ MultiWalletController: state });
    }
  }
}
