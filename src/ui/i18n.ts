import * as i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import * as Locize from 'i18next-locize-backend';

i18n
    .use(reactI18nextModule)
    .use(Locize)
    .init({
        fallbackLng: 'en',
        appendNamespaceToCIMode: true,
        saveMissing: true,
        ns: ['extension'],
        defaultNS: 'extension',

        debug: true,
        keySeparator: '.', // we use content as keys
        nsSeparator: '.', // we use content as keys

        backend: {
            projectId: 'b742d94e-2234-40a1-8b11-979e709e65f3', // <-- replace with your projectId
            apiKey: '6c0ca2b9-b28e-481f-8e65-f8d2fa1ea6d3',
            referenceLng: 'en',
            loadPath: 'https://locize.wvservices.com/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
            privatePath: 'https://locize.wvservices.com/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
            pullPath: 'https://locize.wvservices.com/pull/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
            getLanguagesPath: 'https://locize.wvservices.com/languages/{{projectId}}',
            addPath: 'https://locize.wvservices.com/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
            updatePath: 'https://locize.wvservices.com/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
        },

        interpolation: {
            escapeValue: false, // not needed for react!!
            formatSeparator: ',',
            format: function(value, format, lng) {
                if (format === 'uppercase') return value.toUpperCase();
                return value;
            }
        },

        react: {
            wait: true
        }
    });

export { i18n };
