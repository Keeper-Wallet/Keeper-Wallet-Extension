import * as React from 'react';
import { connect } from 'react-redux';
import { setTab } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';

import { PAGES, PAGES_CONF } from '../pageConfig';



class RootComponent extends React.Component<any, any> {

    props: IProps;
    state = { tab: null };

    static getDerivedStateFromProps(nextProps: IProps) {
        let tab = nextProps.tab;

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
        return <div className="height">
            <Menu {...pageConf.menu} setTab={this.props.setTab}/>
            <Component {...pageConf.props}/>
            <Bottom/>
        </div>;
    }

    static getStateTab(props) {
        if (props.locked) {
            return props.initialized ? PAGES.LOGIN : PAGES.CONDITIONS;
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
