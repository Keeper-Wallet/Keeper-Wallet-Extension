import './ui/styles/global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import { i18nextInit } from 'i18n/init';
import { render } from 'react-dom';

import { AccountsRoot } from './accountsRoot';
import { initUiSentry } from './sentry';

initUiSentry({
  ignoreErrorContext: 'beforeSendAccounts',
  source: 'accounts',
});

i18nextInit().then(() => {
  render(<AccountsRoot />, document.getElementById('app-content'));
});
