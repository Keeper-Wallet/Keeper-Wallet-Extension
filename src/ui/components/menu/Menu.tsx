import * as React from 'react';
import * as styles from './menu.styl';
import { connect } from 'react-redux';
import { setTab } from '../../actions';
import { HeadLogo } from  '../head'
import { translate, Trans } from 'react-i18next';

@translate('menu')
class MenuComponent extends React.PureComponent {

    props: {
        back: string;
        locked: boolean;
        settings: boolean;
        tab: string;
        logo: any;
        setTab: (tmp: string) => void;
    };

    onLeftClick = () => this._onLeftClick();
    onRightClick = () => this._onRightClick();
    onBackClick = () => this._onBackClick();

    render() {
        return (
            <div className={styles.menu}>
            {this._getLogo()}
            {this._getSettings()}
            {this._getNavigation()}
            </div>
        );
    }

    _getLogo() {
        const { logo, locked } = this.props;
        const hasLogo = (logo != null && logo) || locked;
        return !hasLogo ? null : <HeadLogo/>;
    }

    _getSettings() {
        if (this.props.settings) {
            return <div>
                <div className={styles.left}>#</div>
                <div className={styles.right}>*</div>
            </div>
        }
        return null;
    }

    _getNavigation() {
        if (this.props.back) {
            return <div className={styles.back}>=</div>;
        }
        return null;
    }

    _onLeftClick() {
        this.props.setTab('settings');
    }

    _onRightClick() {
        this.props.setTab('info');
    }

    _onBackClick() {
        this.props.setTab('');
    }
}

const mapStateToProps = function(store: any) {
    const { menu = {}, state = {}, tab } = store;
    const { settings, logo, back } = menu;
    const { locked = null } = { ...state };

    return {
        tab,
        back,
        logo,
        locked,
        settings
    };
};

export const Menu = connect(mapStateToProps, { setTab })(MenuComponent);
