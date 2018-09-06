import * as React from 'react';
import { connect } from 'react-redux';
import { setTab } from '../actions';
import {
    Login,
    Intro,
    Conditions,
    NewAccount,
    Import,
    Assets,
    NewWallet,
    NewWalletName,
    BackUpSeed,
    ConfirmBackup
} from './pages';



class RootComponent extends React.Component<any, any> {

    props: IProps;

    render() {

        let storyTab = this.props.tab;

        if (this.props.locked == null) {
            storyTab = 'intro';
        } else if (!storyTab) {
            storyTab = 'conditions';
        }

        if (storyTab && !this.canUseTab(storyTab)) {
            storyTab = this.getStateTab();
        }

        switch (storyTab) {
            case 'conditions':
                return <Conditions/>;
            case 'login':
                return <Login/>;
            case 'new':
                return <NewAccount/>;
            case 'import':
                return <Import/>;
            case 'new_account':
                return <NewWallet/>;
            case 'accountName':
                return <NewWalletName/>;
            case 'safeBackup':
                return <BackUpSeed/>;
            case 'confirmBackup':
                return <ConfirmBackup/>;
            case 'assets':
                return <Assets/>;
            case 'settings':
                return <div>settings</div>;
            case 'info':
                return <div>info</div>;
            case 'intro':
            default:
                return <Intro/>;
        }
    }

    getStateTab() {
        if (this.props.locked) {
            return this.props.initialized ? 'login' : 'conditions';
        }

        return this.props.accounts.length ? 'assets' : 'import';
    }

    canUseTab(tab) {
        switch (tab) {
            case 'new':
            case 'conditions':
                return !this.props.initialized;
            case 'login':
                return this.props.initialized && this.props.locked;
            default:
                return !this.props.locked;
        }
    }
}

const mapStateToProps = function (store: any) {
    return {
        locked: store.state && store.state.locked,
        initialized: store.state && store.state.initialized,
        accounts: store.accounts || [],
        tab: store.tab || '',
        tmpTab: store.tmpTab
    };
};

export const Root = connect(mapStateToProps, { setTab })(RootComponent);


interface IProps {
    locked: boolean;
    initialized: boolean;
    accounts: Array<any>;
    setTab: (tab: string) => void;
    tab: string;
    tmpTab: string;
}
