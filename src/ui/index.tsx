import './styles/app.styl';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './i18n';
import { store } from './store';
import { updateState } from './actions/updateState';
import { Root } from './components/Root';
import { Provider } from 'react-redux';
import backgroundService from './services/Background';

export async function initApp(background: any) {
    backgroundService.init(background);
    backgroundService.on(updateState);
    backgroundService.getNetworks();
    backgroundService.getState();
}

ReactDOM.render(
    <Provider store={store}>
        <div className='app'>
            <Root/>
        </div>
    </Provider>,
    document.getElementById('app-content'));
