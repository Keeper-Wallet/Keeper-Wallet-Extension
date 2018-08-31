import * as React from 'react';
import * as styles from './menu.styl';
import { connect } from 'react-redux';
import { setTmpTab } from '../../actions';
import { HeadLogo } from  '../head'
import { translate, Trans } from 'react-i18next';

@translate('menu')
class MenuComponent extends React.Component {

    props: {
        onMenu: boolean;
        locked: boolean;
        tab: string;
        setTmpTab: (tmp: string) => void;
    };

    onLeftClick = () => this._onLeftClick();
    onRightClick = () => this._onRightClick();
    onBackClick = () => this._onBackClick();

    render() {
        if (!this.props.tab || this.props.tab === 'login') {
            return null;
        }

        if (this.props.locked) {
            return <HeadLogo/>;
        }

        if (!this.props.onMenu) {
            return (
                <div className={styles.menu}>
                    <div className={styles.left}>#</div>
                    <div className={styles.right}>*</div>
                </div>
            );
        }

        return (
            <div className={styles.menu}>
                <div className={styles.back}>=</div>
            </div>
        );
    }

    _onLeftClick() {
        this.props.setTmpTab('settings');
    }

    _onRightClick() {
        this.props.setTmpTab('info');
    }

    _onBackClick() {
        this.props.setTmpTab(null);
    }
}

const mapStateToProps = function(store: any) {
    return {
        onMenu: store.tmpTab,
        locked: store.state.locked,
        tab: store.tab,
    };
};

export const Menu = connect(mapStateToProps, { setTmpTab })(MenuComponent);
