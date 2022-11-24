import './ui/styles/global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';
import './ui/i18n';

import * as React from 'react';
import { render } from 'react-dom';

import { initUiSentry } from './sentry';
import { AccountsRoot } from './accountsRoot';

initUiSentry({
  ignoreErrorContext: 'beforeSendAccounts',
  source: 'accounts',
});

render(<AccountsRoot />, document.getElementById('app-content'));
