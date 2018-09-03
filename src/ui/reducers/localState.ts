import { combineReducers } from 'redux';
import { ACTION } from '../actions/constants';


function newUser(state = {}, action) {
     switch (action.type) {
         case ACTION.SET_PASSWORD_PENDING:
             return {...state, ...action.payload };
         case ACTION.SET_PASSWORD_UPDATE:
             return {...state, ...action.payload };
    }

    return state;
}


export const localState = combineReducers({
    newUser
});
