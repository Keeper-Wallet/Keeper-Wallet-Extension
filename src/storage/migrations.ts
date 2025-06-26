import Browser from 'webextension-polyfill';

interface Migration {
  migrate: () => Promise<void>;
  rollback: () => Promise<void>;
}

const flatState: Migration = {
  migrate: async () => {
    const state = await Browser.storage.local.get();

    await Browser.storage.local.set(
      Object.entries(state).reduce(
        (acc, [key, value]) => {
          if (key.includes('.')) {
            const [controller, field] = key.split('.');
            const controllerData = (acc as any)[controller] || {};
            controllerData[field] = value;
            (acc as any)[controller] = controllerData;
          } else {
            (acc as any)[key] = value;
          }
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    );

    const controllersKeys = Object.keys(state).filter(key => key.includes('.'));

    if (controllersKeys.length > 0) {
      await Browser.storage.local.remove(controllersKeys);
    }
  },

  rollback: async () => {
    const CONTROLLERS_STATE = {
      AssetInfoController: ['assets'],
      CurrentAccountController: ['balances'],
      IdentityController: ['cognitoSessions'],
      IdleController: ['lastUpdateIdle'],
      MessageController: ['messages'],
      NetworkController: [
        'currentNetwork',
        'customNodes',
        'customMatchers',
        'customCodes',
      ],
      NotificationsController: ['notifications'],
      PermissionsController: ['origins', 'blacklist', 'whitelist', 'inPending'],
      PreferencesController: [
        'currentLocale',
        'idleOptions',
        'accounts',
        'currentNetworkAccounts',
        'selectedAccount',
      ],
      RemoteConfigController: [
        'blacklist',
        'whitelist',
        'config',
        'ignoreErrorsConfig',
        'identityConfig',
        'status',
      ],
      StatisticsController: [
        'lastIdleKeeper',
        'lastInstallKeeper',
        'lastOpenKeeper',
        'userId',
      ],
      TrashController: ['data'],
      UiStateController: ['uiState'],
      VaultController: ['locked', 'initialized'],
    };

    const state = await Browser.storage.local.get();

    await Browser.storage.local.set(
      Object.entries(CONTROLLERS_STATE).reduce(
        (acc, [controller, fields]) => ({
          ...acc,
          [controller]: fields.reduce(
            (controllerAcc, field) => ({
              ...controllerAcc,
              [field]: (state as any)[field],
            }),
            {},
          ),
        }),
        {},
      ),
    );
  },
};

const removeCurrentNetworkAccounts: Migration = {
  migrate: async () => {
    await Browser.storage.local.remove(['currentNetworkAccounts']);
  },
  rollback: async () => {
    // noop, they're restored on unlock
  },
};

const profileNetworkMigration: Migration = {
  migrate: async () => {
    try {
      const state = await Browser.storage.local.get();

      if (state.currentNetwork) {
        const oldNetwork = state.currentNetwork;
        let newCurrentProfile = 'mainnet';
        let newCurrentNetwork = 'waves-mainnet';

        switch (oldNetwork) {
          case 'mainnet':
            newCurrentProfile = 'mainnet';
            newCurrentNetwork = 'waves-mainnet';
            break;
          case 'testnet':
            newCurrentProfile = 'testnet';
            newCurrentNetwork = 'waves-testnet';
            break;
          case 'stagenet':
            newCurrentProfile = 'testnet';
            newCurrentNetwork = 'waves-stagenet';
            break;
          case 'custom':
            newCurrentProfile = 'testnet';
            newCurrentNetwork = 'custom';
            break;
          default:
            newCurrentProfile = 'mainnet';
            newCurrentNetwork = 'waves-mainnet';
        }

        await Browser.storage.local.set({
          currentProfile: newCurrentProfile,
          currentNetwork: newCurrentNetwork,
        });
      }

      const fieldsToMigrate = ['customNodes', 'customMatchers', 'customCodes'];

      for (const field of fieldsToMigrate) {
        if (state[field]) {
          const oldData = state[field];
          const newData: Record<string, string | null> = {};

          for (const [oldKey, value] of Object.entries(oldData)) {
            let newKey = oldKey;
            switch (oldKey) {
              case 'mainnet':
                newKey = 'waves-mainnet';
                break;
              case 'testnet':
                newKey = 'waves-testnet';
                break;
              case 'stagenet':
                newKey = 'waves-stagenet';
                break;
              case 'custom':
                newKey = 'custom';
                break;
              default:
                newKey = oldKey;
            }
            newData[newKey] = value as string | null;
          }

          await Browser.storage.local.set({
            [field]: newData,
          });
        }
      }
    } catch (error) {
      console.error('Profile network migration failed:', error);
      throw new Error(`Profile network migration failed: ${error}`);
    }
  },

  rollback: async () => {
    try {
      const state = await Browser.storage.local.get();

      if (state.currentProfile && state.currentNetwork) {
        const currentProfile = state.currentProfile;
        const currentNetwork = state.currentNetwork;

        let oldNetwork = 'mainnet';

        if (currentProfile === 'mainnet') {
          if (
            currentNetwork === 'waves-mainnet' ||
            currentNetwork === 'unit0-mainnet' ||
            currentNetwork === 'all-mainnet'
          ) {
            oldNetwork = 'mainnet';
          }
        } else if (currentProfile === 'testnet') {
          if (currentNetwork === 'waves-testnet') {
            oldNetwork = 'testnet';
          } else if (currentNetwork === 'waves-stagenet') {
            oldNetwork = 'stagenet';
          } else if (currentNetwork === 'custom') {
            oldNetwork = 'custom';
          } else {
            oldNetwork = 'testnet';
          }
        }

        await Browser.storage.local.set({
          currentNetwork: oldNetwork,
        });

        await Browser.storage.local.remove(['currentProfile']);
      }

      const fieldsToRollback = ['customNodes', 'customMatchers', 'customCodes'];

      for (const field of fieldsToRollback) {
        if (state[field]) {
          const newData = state[field];
          const oldData: Record<string, string | null> = {};

          for (const [newKey, value] of Object.entries(newData)) {
            let oldKey = newKey;
            switch (newKey) {
              case 'waves-mainnet':
                oldKey = 'mainnet';
                break;
              case 'waves-testnet':
                oldKey = 'testnet';
                break;
              case 'waves-stagenet':
                oldKey = 'stagenet';
                break;
              case 'custom':
                oldKey = 'custom';
                break;
              default:
                oldKey = newKey;
            }
            oldData[oldKey] = value as string | null;
          }

          await Browser.storage.local.set({
            [field]: oldData,
          });
        }
      }
    } catch (error) {
      console.error('Profile network rollback failed:', error);
      throw new Error(`Profile network rollback failed: ${error}`);
    }
  },
};

const flattenBalances: Migration = {
  migrate: async () => {
    const { balances } = await Browser.storage.local.get('balances');

    if (!balances) {
      return;
    }

    await Browser.storage.local.remove('balances');

    await Browser.storage.local.set(
      Object.fromEntries(
        Object.entries(balances).map(([address, balance]) => {
          return [`balance_${address}`, balance];
        }),
      ),
    );
  },

  rollback: async () => {
    const state = await Browser.storage.local.get();

    const balances = Object.fromEntries(
      Object.entries(state)
        .map(([key, value]) => {
          const match = key.match(/^balance_(.*)$/);

          if (!match) {
            return null;
          }

          const [, address] = match;

          return [address, value];
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    );

    await Browser.storage.local.remove(
      Object.keys(state).filter(key => key.startsWith('balance_')),
    );

    await Browser.storage.local.set({ balances });
  },
};

const migrateOldWavesAccounts: Migration = {
  migrate: async () => {
    const state = await Browser.storage.local.get('accounts');
    if (!Array.isArray(state.accounts)) return;
    let changed = false;
    const migrated = state.accounts.map(acc => {
      if (
        acc &&
        !('accountType' in acc) &&
        typeof acc.address === 'string' &&
        typeof acc.publicKey === 'string' &&
        typeof acc.network === 'string' &&
        typeof acc.name === 'string'
      ) {
        changed = true;
        return {
          accountType: 'waves',
          id: acc.address,
          address: acc.address,
          name: acc.name,
          network: acc.network,
          networkCode: acc.networkCode || 'W',
          publicKey: acc.publicKey,
          chain: 'waves',
          type: acc.type || 'seed',
          lastUsed: acc.lastUsed,
        };
      }
      return acc;
    });
    if (changed) {
      await Browser.storage.local.set({ accounts: migrated });
    }
  },
  rollback: async () => {},
};

export const migrations: Migration[] = [
  flatState,
  removeCurrentNetworkAccounts,
  profileNetworkMigration,
  flattenBalances,
  migrateOldWavesAccounts,
];
