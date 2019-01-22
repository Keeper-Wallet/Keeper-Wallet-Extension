import * as i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import { default as Locize } from 'i18next-locize-backend';
import { I18N_NAME_SPACE, I18N_API_KEY, I18N_PROJECT_ID, WAVESKEEPER_DEBUG } from './appConfig';


let backendPath = { loadPath: './_locales/{{lng}}/{{ns}}_{{lng}}.json' } as any;

if (WAVESKEEPER_DEBUG) {
    backendPath = {
        loadPath: 'https://locize.wvservices.com/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
        privatePath: 'https://api.locize.io/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
        pullPath: 'https://api.locize.io/pull/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
        getLanguagesPath: 'https://api.locize.io/languages/{{projectId}}',
        //addPath: 'https://api.locize.io/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
        //updatePath: 'https://api.locize.io/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    };
}

i18n
    .use(reactI18nextModule)
    .use(Locize)
    .init({
        fallbackLng: 'en',
        appendNamespaceToCIMode: true,
        saveMissing: WAVESKEEPER_DEBUG,
        ns: [I18N_NAME_SPACE],
        defaultNS: I18N_NAME_SPACE,

        debug: WAVESKEEPER_DEBUG,
        keySeparator: '.', // we use content as keys
        nsSeparator: '.', // we use content as keys

        backend: {
            projectId: I18N_PROJECT_ID,
            apiKey: I18N_API_KEY,
            referenceLng: 'en',
            ...backendPath
        },

        interpolation: {
            formatSeparator: ',',
            format: function(value, format, lng) {
                if (format === 'uppercase') return value.toUpperCase();
                return value;
            }
        },

        react: {
            wait: true//!WAVESKEEPER_DEBUG
        }
    });

const LANGS = [
    {
        id: 'en',
        name: 'English'
    },
    {
        id: 'ru',
        name: 'Русский'
    },
    {
        id: 'ko',
        name: '한국어'
    },
    {
        id: 'zh',
        name: '中文(简体)'
    },
    {
        id: 'tr',
        name: 'Türkçe'
    },
    {
        id: 'hi',
        name: 'हिन्दी'
    },
    {
        id: 'es',
        name: 'Español'
    },
    {
        id: 'pt',
        name: 'Portugal'
    },
    {
        id: 'pl',
        name: 'Polsk'
    }
];

export { i18n, LANGS };
