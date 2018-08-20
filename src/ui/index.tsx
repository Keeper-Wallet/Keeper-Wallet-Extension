import * as React from "react";
import * as ReactDOM from "react-dom";
import { store } from './store';
import { Root } from './components/Root';

export async function initApp(background: any) {
    const state = await background.getState();
    store.dispatch({ state, type: 'update' });
    
    background.on('update', (state) => {
        store.dispatch({ state, type: 'update' })
    });

    ReactDOM.render(<Root background={background}/>, document.getElementById("app-content"))
}



