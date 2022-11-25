import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import { I18N_NAME_SPACE } from '../ui/appConfig';

export function i18nextInit() {
  return i18next
    .use(
      resourcesToBackend((lng, ns, clb) => {
        import(`./locales/${lng}/${ns}.${lng}.json`)
          .then(resources => clb(null, resources))
          .catch(err => clb(err, null));
      })
    )
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      ns: [I18N_NAME_SPACE],
      defaultNS: I18N_NAME_SPACE,
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
    });
}
