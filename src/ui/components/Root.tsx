import * as React from 'react';
import { connect } from 'react-redux';
import { setTab, addBackTab, removeBackTab } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';



class RootComponent extends React.Component<any, any> {

    props: IProps;
    state = { tab: null };

    static getDerivedStateFromProps(nextProps: IProps) {

        let tab = nextProps.tab;

        if (nextProps.messages && nextProps.messages.length) {
            //tab = PAGES.MESSAGES
        }

        if (!nextProps.accounts.length) {
            tab = PAGES.IMPORT;
        }

        if (!tab && nextProps.locked == null) {
            tab = PAGES.INTRO;
        } else if (!tab && nextProps.locked) {
            tab = PAGES.CONDITIONS;
        }

        if (!tab || tab && !RootComponent.canUseTab(nextProps, tab)) {
            tab = RootComponent.getStateTab(nextProps);
        }

        return { tab };
    }

    render() {
        const pageConf = PAGES_CONF[this.state.tab] || PAGES_CONF[PAGES.INTRO];
        const Component = pageConf.component;
        const backTabFromConf = typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;
        const currentTab = this.state.tab;
        const { backTabs } = this.props;
        const menuProps = {
            hasLogo: pageConf.menu.hasLogo,
            hasSettings: pageConf.menu.hasSettings,
            deleteAccount: pageConf.menu.deleteAccount,
            hasClose: !!pageConf.menu.close,
            hasBack: pageConf.menu.back !== null && (typeof pageConf.menu.back === 'string' || !!pageConf.menu.back)
        };

        const setTab = (tab) => {
            this.props.addBackTab(currentTab);
            this.props.setTab(tab);
        };

        const onBack = () => {
            const tab = backTabFromConf || backTabs[backTabs.length - 1] || PAGES.ROOT;
            this.props.removeBackTab();
            this.props.setTab(tab);
        };

        const onDelete = () => {
            setTab(PAGES.DELETE_ACTIVE_ACCOUNT);
        };

        const pageProps = { ...pageConf.props, setTab, onBack };

        return <div className="height">
            <Menu {...menuProps} setTab={setTab} onBack={onBack} onDelete={onDelete}/>
            <Component {...pageProps}/>
            <Bottom {...pageConf.bottom}/>
        </div>;
    }

    static getStateTab(props) {
        if (props.locked) {
            return props.initialized ? PAGES.LOGIN : PAGES.CONDITIONS;
        }

        if (props.ui && props.ui.account) {
            return PAGES.NEW_ACCOUNT;
        }

        return props.accounts.length ? PAGES.ASSETS : PAGES.IMPORT;
    }

    static canUseTab(props, tab) {
        switch (tab) {
            case PAGES.NEW:
            case PAGES.CONDITIONS:
                return !props.initialized;
            case PAGES.LOGIN:
                return props.initialized && props.locked;
            default:
                return !props.locked;
        }
    }
}

const mapStateToProps = function (store: any) {
    return {
        locked: store.state && store.state.locked,
        initialized: store.state && store.state.initialized,
        accounts: store.accounts || [],
        tab: store.tab || '',
        tmpTab: store.tmpTab,
        backTabs: store.backTabs,
        ui: store.uiState,
        messages: store.messages
    };
};

export const Root = connect(mapStateToProps, { setTab, addBackTab, removeBackTab })(RootComponent);


interface IProps {
    locked: boolean;
    initialized: boolean;
    accounts: Array<any>;
    setTab: (tab: string) => void;
    addBackTab: (tab: string) => void;
    removeBackTab: () => void;
    tab: string;
    backTabs: Array<string>;
    messages: Array<any>;
}
