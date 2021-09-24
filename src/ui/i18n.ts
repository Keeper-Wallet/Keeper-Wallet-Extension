import i18next, { i18n as i18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-locize-backend';
import { I18N_NAME_SPACE, WAVESKEEPER_DEBUG } from './appConfig';

const createI18n = (): i18nInstance => {
    const i18n = i18next.createInstance().use(initReactI18next);

    i18n.use(Backend).init({
        debug: WAVESKEEPER_DEBUG,
        lng: 'en',
        fallbackLng: 'en',
        ns: [I18N_NAME_SPACE],
        defaultNS: I18N_NAME_SPACE,
        backend: {
            loadPath: './_locales/{{lng}}/{{ns}}.{{lng}}.json',
        },
        react: {
            wait: true,
        },
    });

    return i18n;
};

export const LANGS = [
    {
        id: 'en',
        name: 'English',
    },
    {
        id: 'ru',
        name: 'Русский',
    },
    {
        id: 'ko',
        name: '한국어',
    },
    {
        id: 'zh',
        name: '中文(简体)',
    },
    {
        id: 'tr',
        name: 'Türkçe',
    },
    {
        id: 'hi',
        name: 'हिन्दी',
    },
    {
        id: 'es',
        name: 'Español',
    },
    {
        id: 'pt',
        name: 'Portugal',
    },
    {
        id: 'pl',
        name: 'Polsk',
    },
];

export const i18n = createI18n();
