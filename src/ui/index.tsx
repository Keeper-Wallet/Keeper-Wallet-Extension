import './styles/app.styl';
import './styles/icons.styl';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { LANGS } from './i18n';
import { store } from './store';
import { updateState } from './actions/updateState';
import { setLangs } from './actions';
import { Root } from './components/Root';
import { Provider } from 'react-redux';
import backgroundService from './services/Background';

store.dispatch(setLangs(LANGS));

export async function initApp(background: any) {
    backgroundService.init(background);
    backgroundService.on(updateState);
    backgroundService.getNetworks();
    backgroundService.getState();
    document.addEventListener('mousemove', () => backgroundService.updateIdle());
    document.addEventListener('keyup', () => backgroundService.updateIdle());
    document.addEventListener('mousedown', () => backgroundService.updateIdle());
    document.addEventListener('focus', () => backgroundService.updateIdle());
}


ReactDOM.render(
    <Provider store={store}>
        <div className='app'>
            <Root/>
        </div>
    </Provider>,
    document.getElementById('app-content'));
