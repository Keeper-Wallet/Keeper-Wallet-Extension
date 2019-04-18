import * as React from 'react';
import { connect } from 'react-redux';
import { setTab, addBackTab, removeBackTab, loading, setUiState } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { I18N_NAME_SPACE } from '../appConfig';
import { translate } from 'react-i18next';


const NO_USER_START_PAGE = PAGES.WELCOME;
const USER_START_PAGE = PAGES.LOGIN;

@translate(I18N_NAME_SPACE)
class RootComponent extends React.Component {
    
    props: IProps;
    state = { tab: null, loading: true };
    
    constructor(props: IProps) {
        super(props);
        setTimeout(() => props.setLoading(false), 200);
    }
    
    render() {
        const tab = this.state.tab || PAGES.INTRO;
        const pageConf = PAGES_CONF[tab];
        const Component = pageConf.component;
        const backTabFromConf = typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;
        const currentTab = this.state.tab;
        const { backTabs } = this.props;
        const menuProps = {
            hasLogo: pageConf.menu.hasLogo,
            hasSettings: pageConf.menu.hasSettings,
            deleteAccount: pageConf.menu.deleteAccount,
            hasClose: !!pageConf.menu.close,
            hasBack: pageConf.menu.back !== null && (typeof pageConf.menu.back === 'string' || !!pageConf.menu.back),
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
            <Component {...pageProps} key={tab}/>
            <Bottom {...pageConf.bottom}/>
        </div>;
    }
    
    static getDerivedStateFromProps(nextProps: IProps) {
        /**
         * Loading page
         */
        if (nextProps.loading) {
            return { tab: PAGES.INTRO };
        }
    
        /**
         * Select lang page
         */
            // // select langs at first
        // if (!nextProps.ui.selectedLangs) {
        //     return { tab: PAGES.LANGS_SETTINGS_INTRO };
        // }
        
        let tab = nextProps.tab;
    
        /**
         * Intro page on load
         */
        if (!tab && nextProps.locked == null) {
            tab = PAGES.INTRO;
        }
        
        /**
         * Has notify - show confirm page
         */
        const { messages, notifications, activeMessage, activeNotification, accounts } = nextProps;
        
        if (!nextProps.locked && tab !== PAGES.CHANGE_TX_ACCOUNT && accounts.length) {
            if (activeMessage) {
                tab = PAGES.MESSAGES;
            } else if (messages.length + notifications.length > 1) {
                tab = PAGES.MESSAGES_LIST;
            } else if (activeNotification) {
                tab = PAGES.NOTIFICATIONS
            }
        }
    
        /**
         * Start page on locked keeper
         */
        if (!tab && nextProps.locked) {
            tab = NO_USER_START_PAGE;
        }
        
        if (!tab || tab && !RootComponent.canUseTab(nextProps, tab)) {
            tab = RootComponent.getStateTab(nextProps);
        }
        
        return { tab };
    }
    
    static getStateTab(props) {
        if (props.locked) {
            return props.initialized ? USER_START_PAGE : NO_USER_START_PAGE;
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
            case PAGES.INTRO:
                return !props.initialized;
            case PAGES.LOGIN:
            case PAGES.FORGOT:
                return props.initialized && props.locked;
            case PAGES.ASSETS:
                return !props.locked && props.accounts.length;
            default:
                return !props.locked;
        }
    }
}

const mapStateToProps = function (store: any) {
    return {
        loading: store.localState.loading,
        locked: store.state && store.state.locked,
        initialized: store.state && store.state.initialized,
        accounts: store.accounts || [],
        tab: store.tab || '',
        tmpTab: store.tmpTab,
        backTabs: store.backTabs,
        ui: store.uiState,
        messages: store.messages,
        notifications: store.notifications,
        activeMessage: store.activeMessage,
        activeNotification: store.activeNotification,
    };
};

const actions = {
    setUiState,
    setLoading: loading,
    setTab,
    addBackTab,
    removeBackTab,
};

export const Root = connect(mapStateToProps, actions)(RootComponent as any);

interface IProps {
    locked: boolean;
    initialized: boolean;
    accounts: Array<any>;
    setTab: (tab: string) => void;
    addBackTab: (tab: string) => void;
    removeBackTab: () => void;
    setLoading: (enable: boolean) => void;
    tab: string;
    backTabs: Array<string>;
    messages: Array<any>;
    notifications: Array<any>;
    activeMessage: any;
    activeNotification: any;
    loading: boolean;
    ui: any;
}
