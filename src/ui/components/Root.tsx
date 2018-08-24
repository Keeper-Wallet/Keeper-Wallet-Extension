import * as React from 'react';
import { connect } from 'react-redux';
import { IUiState } from '../store';
import { setTab } from '../actions/setTab';
import service from '../services/Background';
import { Login } from './pages/Login';
import { Intro } from './pages/Intro';
import { Conditions } from './pages/Conditions';
import { NewAccount } from './pages/NewAccount';



class RootComponent extends React.Component<any, any> {

    props: IProps;

    render() {

        let storyTab = this.props.uiState.tab;

        if (this.props.locked == null) {
            storyTab = '';
        } else if (!storyTab) {
            storyTab = 'conditions';
        }

        if (storyTab && !this.canUseTab(storyTab)) {
            service.setUiState({ tab : this.getStateTab() });
            storyTab = '';
        }

        switch (storyTab) {
            case 'conditions':
                return <Conditions/>;
            case 'login':
                return <Login/>;
            case 'new':
                return <NewAccount/>;
            case 'assets':
            case 'import':
            case 'intro':
            default:
                return <Intro/>;
        }
    }

    getStateTab() {
        if (this.props.locked) {
            return this.props.hasAccount ? 'login' : 'conditions';
        }

        return this.props.accounts.length ? 'assets' : 'import';
    }

    canUseTab(tab) {
        switch (tab) {
            case 'new':
            case 'conditions':
                return !this.props.hasAccount;
            case 'login':
                return this.props.hasAccount;
            default:
                return !this.props.locked;
        }
    }
}

const mapStateToProps = function (store: any) {
    return {
        locked: store.state.locked,
        hasAccount: store.state.hasAccount,
        accounts: store.state.accounts || [],
        uiState: store.state.uiState || {}
    };
};

export const Root = connect(mapStateToProps, { setTab })(RootComponent);


interface IProps {
    locked: boolean;
    hasAccount: boolean;
    accounts: Array<any>;
    uiState: IUiState;
    setTab: (tab: string) => void;
}
