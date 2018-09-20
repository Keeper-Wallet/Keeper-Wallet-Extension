import {
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
} from './components/pages';

import { ImportSeed } from './components/pages/ImportSeedWalet';


export const PAGES = {
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
    ROOT: '',
};

export const PAGES_CONF = {
    [PAGES.CONDITIONS]: {
        component: Conditions
            ,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.LOGIN]: {
        component: Login,
        menu: {
            hasLogo: true,
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
            hasSettings: false,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
            noChangeNetwork: true,
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
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.INFO]: {
        component: Info,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.ACCOUNT_INFO]: {
        component: AccountInfo,
        bottom: {
            noChangeNetwork: true,
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
            noChangeNetwork: true,
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.QR_CODE_SELECTED]: {
        component: QRCodeSelectedAccount,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.INTRO]: {
        component: Intro,
        menu: {
            hasLogo: false,
            hasSettings: false,
            back: null,
        }
    },
};
