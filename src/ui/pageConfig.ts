import {
    Welcome,
    Login,
    Intro,
    Conditions,
    NewAccount,
    Import,
    Assets,
    NewWallet,
    NewWalletName,
    BackUpSeed,
    ConfirmBackup,
    Settings,
    Info,
    AccountInfo,
    DeleteActiveAccount,
    ChangeAccountName,
    QRCodeSelectedAccount,
    NetworksSettings,
    LangsSettings,
    ChangePassword,
    DeleteAccount,
    Messages,
    ForgotPassword, SelectTxAccount,
} from './components/pages';

import { ImportSeed } from './components/pages/ImportSeedWalet';


export const PAGES = {
    WELCOME: 'welcome',
    CONDITIONS: 'conditions',
    LOGIN: 'login',
    NEW: 'new',
    IMPORT: 'import',
    IMPORT_FROM_ASSETS: 'import_and_back_to_assets',
    NEW_ACCOUNT: 'new_account',
    NEW_ACCOUNT_BACK: 'new_account_back',
    ACCOUNT_NAME: 'account_name',
    ACCOUNT_NAME_SEED: 'account_name_seed',
    SAVE_BACKUP: 'safe_backup',
    CONFIRM_BACKUP: 'confirm_backup',
    IMPORT_SEED: 'import_seed',
    IMPORT_SEED_BACK: 'import_seed_back',
    ASSETS: 'assets',
    SETTINGS: 'settings',
    INFO: 'info',
    ACCOUNT_INFO: 'account_info',
    DELETE_ACTIVE_ACCOUNT: 'delete_active_account',
    CHANGE_ACCOUNT_NAME: 'change_account_name',
    QR_CODE_SELECTED: 'qr_code_selected_account',
    INTRO: 'intro',
    NETWORK_SETTINGS: 'networks_select',
    LANGS_SETTINGS: 'langs_settings',
    LANGS_SETTINGS_INTRO: 'langs_settings_intro',
    CHANGE_PASSWORD: 'change_password_settings',
    DELETE_ACCOUNT: 'delete_account',
    MESSAGES: 'messages',
    FORGOT: 'forgot_password',
    CHANGE_TX_ACCOUNT: 'change_tx_account',
    ROOT: '',
};

export const PAGES_CONF = {
    [PAGES.WELCOME]: {
        component: Welcome,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.CONDITIONS]: {
        component: Conditions,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.LOGIN]: {
        component: Login,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.NEW]: {
        component: NewAccount,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.IMPORT]: {
        component: Import,
        menu: {
            hasLogo: true,
            hasSettings: true,
            back: null,
        }
    },
    [PAGES.IMPORT_FROM_ASSETS]: {
        component: Import,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.NEW_ACCOUNT]: {
        component: NewWallet,
        props: {
            isGenerateNew: true,
        },
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.NEW_ACCOUNT_BACK]: {
        component: NewWallet,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.ACCOUNT_NAME]: {
        component: NewWalletName,
        props: {
            next: PAGES.SAVE_BACKUP
        },
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.NEW_ACCOUNT_BACK,
        }
    },
    [PAGES.ACCOUNT_NAME_SEED]: {
        component: NewWalletName,
        props: {
            isCreate: true,
            next: PAGES.SAVE_BACKUP
        },
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.IMPORT_SEED_BACK,
        }
    },
    [PAGES.CHANGE_ACCOUNT_NAME]: {
        component: ChangeAccountName,
        props: {
        },
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.SAVE_BACKUP]: {
        component: BackUpSeed,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.ACCOUNT_NAME,
        }
    },
    [PAGES.CONFIRM_BACKUP]: {
        component: ConfirmBackup,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.SAVE_BACKUP,
        }
    },
    [PAGES.IMPORT_SEED]: {
        component: ImportSeed,
        props: {
            isNew: true
        },
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.IMPORT_SEED_BACK]: {
        component: ImportSeed,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.ASSETS]: {
        component: Assets,
        menu: {
            hasLogo: true,
            hasSettings: true,
            back: null,
        }
    },
    [PAGES.SETTINGS]: {
        component: Settings,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: false,
            close: true,
        }
    },
    [PAGES.INFO]: {
        component: Info,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.ACCOUNT_INFO]: {
        component: AccountInfo,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
            deleteAccount: true,
        }
    },
    [PAGES.DELETE_ACTIVE_ACCOUNT]: {
        component: DeleteActiveAccount,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.QR_CODE_SELECTED]: {
        component: QRCodeSelectedAccount,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.INTRO]: {
        component: Intro,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.NETWORK_SETTINGS]: {
        component: NetworksSettings,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.LANGS_SETTINGS]: {
        component: LangsSettings,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.LANGS_SETTINGS_INTRO]: {
        component: LangsSettings,
        props: {
            confirm: true,
            hideTitle: true
        },
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: false,
        }
    },
    [PAGES.CHANGE_PASSWORD]: {
        component: ChangePassword,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.DELETE_ACCOUNT]: {
        component: DeleteAccount,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.FORGOT]: {
        component: ForgotPassword,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: false,
        }
    },
    [PAGES.MESSAGES]: {
        component: Messages,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: false,
        }
    },
    [PAGES.CHANGE_TX_ACCOUNT]: {
        component: SelectTxAccount,
        bottom: {
            hide: true,
        },
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: false,
        }
    }
};
