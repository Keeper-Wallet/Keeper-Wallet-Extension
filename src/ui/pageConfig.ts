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
    ConfirmBackup
} from './components/pages';
import { ImportSeed } from './components/pages/ImportSeedWalet';

export const PAGES = {
    CONDITIONS: 'conditions',
    LOGIN: 'login',
    NEW: 'new',
    IMPORT: 'import',
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
    [PAGES.NEW_ACCOUNT]: {
        component: NewWallet,
        props: {
            isGenerateNew: true
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.ROOT,
        }
    },
    [PAGES.NEW_ACCOUNT_BACK]: {
        component: NewWallet,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.ROOT,
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
            back: PAGES.NEW_ACCOUNT_BACK,
        }
    },
    [PAGES.ACCOUNT_NAME_SEED]: {
        component: NewWalletName,
        props: {
            isCreate: true,
            next: PAGES.ROOT
        },
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.IMPORT_SEED_BACK,
        }
    },
    [PAGES.SAVE_BACKUP]: {
        component: BackUpSeed,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.ACCOUNT_NAME,
        }
    },
    [PAGES.CONFIRM_BACKUP]: {
        component: ConfirmBackup,
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
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: '',
        }
    },
    [PAGES.IMPORT_SEED_BACK]: {
        component: ImportSeed,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: '',
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
        component: () => 'settings',
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.INFO]: {
        component: () => 'info',
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: null,
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
