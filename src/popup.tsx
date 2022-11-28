import './global.css';
import './ui/styles/app.styl';
import './ui/styles/icons.styl';

import { i18nextInit } from 'i18n/init';
import { render } from 'react-dom';
import { initUiSentry } from 'sentry';

import { PopupRoot } from './popupRoot';

initUiSentry({
  ignoreErrorContext: 'beforeSendPopup',
  source: 'popup',
});

i18nextInit().then(() => {
  render(<PopupRoot />, document.getElementById('app-content'));
});
