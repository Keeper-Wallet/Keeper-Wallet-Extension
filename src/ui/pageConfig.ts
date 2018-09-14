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
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: null,
        }
    },
    [PAGES.ACCOUNTNAME]: {
        component: NewWalletName,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: 'new_account',
        }
    },
    [PAGES.SAFEBACKUP]: {
        component: BackUpSeed,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: 'accountName',
        }
    },
    [PAGES.CONFIRMBACKUP]: {
        component: ConfirmBackup,
        menu: {
            hasLogo: true,
            hasSettings: false,
            back: 'safeBackup',
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
