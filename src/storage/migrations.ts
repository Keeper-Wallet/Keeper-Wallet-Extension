import Browser from 'webextension-polyfill';

interface Migration {
  migrate: () => Promise<void>;
  rollback: () => Promise<void>;
}

const flatState: Migration = {
  migrate: async () => {
    // this should potentially fix FILE_ERROR_NO_SPACE error
    await Browser.storage.local.remove([
      'AssetInfoController',
      'CurrentAccountController',
    ]);

    const state = await Browser.storage.local.get();

    const CONTROLLERS = [
      'AssetInfoController',
      'CurrentAccountController',
      'IdentityController',
      'IdleController',
      'MessageController',
      'NetworkController',
      'NotificationsController',
      'PermissionsController',
      'PreferencesController',
      'RemoteConfigController',
      'StatisticsController',
      'TrashController',
      'UiStateController',
      'VaultController',
    ];

    const migrateFields = CONTROLLERS.filter(controller => state[controller]);

    if (migrateFields.length === 0) {
      return;
    }

    await Browser.storage.local.set(
      migrateFields.reduce(
        (acc, field) => ({
          ...acc,
          ...(state[field] as Record<string, unknown>),
        }),
        {},
      ),
    );

    await Browser.storage.local.remove(migrateFields);
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
              [field]: state[field],
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

export const MIGRATIONS: Migration[] = [
  flatState,
  removeCurrentNetworkAccounts,
  flattenBalances,
];
