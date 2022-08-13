import { extension } from '../lib/extension';

interface Migration {
  migrate: () => Promise<void>;
  rollback: () => Promise<void>;
}

const flatState: Migration = {
  migrate: async () => {
    // this should potentially fix FILE_ERROR_NO_SPACE error
    await extension.storage.local.remove([
      'AssetInfoController',
      'CurrentAccountController',
    ]);

    const state = await extension.storage.local.get();

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

    await extension.storage.local.set(
      migrateFields.reduce(
        (acc, field) => ({
          ...acc,
          ...(state[field] as Record<string, unknown>),
        }),
        {}
      )
    );

    await extension.storage.local.remove(migrateFields);
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

    const state = await extension.storage.local.get();

    await extension.storage.local.set(
      Object.entries(CONTROLLERS_STATE).reduce(
        (acc, [controller, fields]) => ({
          ...acc,
          [controller]: fields.reduce(
            (controllerAcc, field) => ({
              ...controllerAcc,
              [field]: state[field],
            }),
            {}
          ),
        }),
        {}
      )
    );
  },
};

const removeCurrentNetworkAccounts: Migration = {
  migrate: async () => {
    await extension.storage.local.remove(['currentNetworkAccounts']);
  },
  rollback: async () => {
    // noop, they're restored on unlock
  },
};

export const MIGRATIONS: Migration[] = [
  flatState,
  removeCurrentNetworkAccounts,
];
