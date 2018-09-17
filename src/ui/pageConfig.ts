import * as React from 'react';

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
    Info, AccountInfo
} from './components/pages';
import { ImportSeed } from './components/pages/ImportSeedWalet';

export const PAGES = {
    CONDITIONS: 'conditions',
    LOGIN: 'login',
    NEW: 'new',
    IMPORT: 'import',
    IMPORT_FROM_ASSETS: 'importAndBackToAssets',
    NEW_ACCOUNT: 'new_account',
    NEW_ACCOUNT_BACK: 'new_account_back',
    ACCOUNT_NAME: 'accountName',
    ACCOUNT_NAME_SEED: 'accountNameSeed',
    SAVE_BACKUP: 'safeBackup',
    CONFIRM_BACKUP: 'confirmBackup',
    IMPORT_SEED: 'import_seed',
    IMPORT_SEED_BACK: 'import_seed_back',
    ASSETS: 'assets',
    SETTINGS: 'settings',
    INFO: 'info',
    ACOOUNT_INFO: 'accountInfo',
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
            isGenerateNew: true
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.NEW_ACCOUNT_BACK]: {
        component: NewWallet,
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
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.ACCOUNT_NAME_SEED]: {
        component: NewWalletName,
        props: {
            isCreate: true,
            next: PAGES.SAVE_BACKUP
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.SAVE_BACKUP]: {
        component: BackUpSeed,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.CONFIRM_BACKUP]: {
        component: ConfirmBackup,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.IMPORT_SEED]: {
        component: ImportSeed,
        props: {
            isNew: true
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
        }
    },
    [PAGES.IMPORT_SEED_BACK]: {
        component: ImportSeed,
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
    [PAGES.ACOOUNT_INFO]: {
        component: AccountInfo,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: true,
            deleteAccount: true,
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
