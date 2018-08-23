import * as React from 'react';
import { Route, Switch } from 'react-router';
import { connect } from 'react-redux';

import { Login } from './pages/Login';
import { Intro } from './pages/Intro';
import { Conditions } from './pages/Conditions';
import { NewAccount } from './pages/NewAccount';



class RootComponent extends React.Component<any, any> {

    state: IState;
    props: IProps;

    render() {

        return <Switch>
            <Route exact path='/' component={Intro}/>
            <Route path='/login' component={Login}/>
            <Route exact path='/conditions' component={Conditions}/>
            <Route exact path='/new' component={NewAccount}/>
        </Switch>;
    }
}

const mapStateToProps = function (store: any) {
    return {
        locked: store.state.locked,
        hasAccount: store.state.hasAccount,
    };
};

export const Root = connect(mapStateToProps)(RootComponent);


interface IProps {
    state: {
        locked: boolean;
        hasAccount: boolean;
        currentLocale: string;
        accounts: Array<any>;
        currentNetwork: string;
        messages: Array<any>;
        balances: any;
    };
    app: any;
}

interface IState {

}
