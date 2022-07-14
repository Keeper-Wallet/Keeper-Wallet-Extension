import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as resourcesToBackend from 'i18next-resources-to-backend';
import { I18N_NAME_SPACE, KEEPERWALLET_DEBUG } from './appConfig';

const backend = (
  resourcesToBackend as unknown as typeof resourcesToBackend.default
)((lng, ns, clb) => {
  import(
    /* webpackMode: 'eager' */
    `../copied/_locales/${lng}/${ns}.${lng}.json`
  )
    .then(resources => clb(null, resources))
    .catch(err => clb(err, null));
});

i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    debug: KEEPERWALLET_DEBUG,
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
    id: 'tr',
    name: 'Türkçe',
  },
  {
    id: 'pt',
    name: 'Portugal',
  },
  {
    id: 'es',
    name: 'Español',
  },
  {
    id: 'id',
    name: 'Bahasa Indonesia',
  },
  {
    id: 'ja',
    name: '日本語',
  },
  {
    id: 'th',
    name: 'ภาษาไทย',
  },
  {
    id: 'vi',
    name: 'tiếng Việt',
  },
  {
    id: 'zh',
    name: '中文',
  },
].sort((firstLang, secondLang) =>
  firstLang.name.localeCompare(secondLang.name)
);

export default i18n;
