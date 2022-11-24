import './ui/styles/global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import { render } from 'react-dom';

import { AccountsRoot } from './accountsRoot';
import { initUiSentry } from './sentry';

initUiSentry({
  ignoreErrorContext: 'beforeSendAccounts',
  source: 'accounts',
});

render(<AccountsRoot />, document.getElementById('app-content'));
