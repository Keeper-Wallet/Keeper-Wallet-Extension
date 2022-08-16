import ExtensionStore, { StoreLocalState } from 'lib/localStore';

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

async function reverseMigrateFlatState(this: ExtensionStore) {
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

export const REVERSE_MIGRATIONS = [reverseMigrateFlatState];
