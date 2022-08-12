import ExtensionStore, { StoreLocalState } from '../storage/storage';

async function reverseMigrateFlatState(this: ExtensionStore) {
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

  const state = await this.get();

  await this.set(
    Object.entries(CONTROLLERS_STATE).reduce(
      (acc, [controller, fields]) => ({
        ...acc,
        [controller]: (fields as Array<keyof StoreLocalState>).reduce(
          (controllerAcc, field) => ({
            ...controllerAcc,
            [field]: state[field],
          }),
          {}
        ),
      }),
      {}
    ) as StoreLocalState
  );
}

async function reverseMigrateRemoveCurrentNetworkAccounts(
  this: ExtensionStore
) {
  // noop, they're restored on unlock
}

export const REVERSE_MIGRATIONS = [
  reverseMigrateFlatState,
  reverseMigrateRemoveCurrentNetworkAccounts,
];
