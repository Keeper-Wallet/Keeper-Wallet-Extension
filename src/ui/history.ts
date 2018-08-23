import { syncHistoryWithStore } from 'react-router-redux';
import { createHashHistory } from 'history';
import {store} from "./store";

export const history = syncHistoryWithStore(createHashHistory(), store);
