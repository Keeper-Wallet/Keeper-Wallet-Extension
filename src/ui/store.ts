import { createStore } from 'redux';

const storeData = { state: {}, app: {} };

export const store = createStore(updateState);

interface IState extends Object {
    type: string,
    state: any;
}
