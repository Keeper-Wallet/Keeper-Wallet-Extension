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

export const PAGES = {
    CONDITIONS: 'conditions',
    LOGIN: 'login',
    NEW: 'new',
    IMPORT: 'import',
    NEW_ACCOUNT: 'new_account',
    NEW_ACCOUNT_BACK: 'new_account_back',
    ACCOUNTNAME: 'accountName',
    SAFEBACKUP: 'safeBackup',
    CONFIRMBACKUP: 'confirmBackup',
    ASSETS: 'assets',
    SETTINGS: 'settings',
    INFO: 'info',
    INTRO: 'intro',
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
            back: '',
        }
    },
    [PAGES.NEW_ACCOUNT_BACK]: {
        component: NewWallet,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: '',
        }
    },
    [PAGES.ACCOUNTNAME]: {
        component: NewWalletName,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.NEW_ACCOUNT_BACK,
        }
    },
    [PAGES.SAFEBACKUP]: {
        component: BackUpSeed,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.ACCOUNTNAME,
        }
    },
    [PAGES.CONFIRMBACKUP]: {
        component: ConfirmBackup,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: PAGES.SAFEBACKUP,
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
