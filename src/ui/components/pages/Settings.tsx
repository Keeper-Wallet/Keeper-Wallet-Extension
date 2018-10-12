import * as styles from './styles/settings.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { lock } from '../../actions';
import { PAGES } from '../../pageConfig';

@translate('extension')
class SettingsComponent extends React.Component {

    readonly props;
    lock = () => this.props.lock();
    networkHandler = () => this.props.setTab(PAGES.NETWORK_SETTINGS);
    langsHandler = () => this.props.setTab(PAGES.LANGS_SETTINGS);
    passwordHandler = () => this.props.setTab(PAGES.CHANGE_PASSWORD);
    deleteHandler = () => this.props.setTab(PAGES.DELETE_ACCOUNT);

    render() {
        return <div className={styles.content}>

            <div className={`${styles.settingsMenuItem} ${styles.network}`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.networkHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.network'>Network</Trans>
                    </div>
                </Button>
            </div>

            {/*<div className={`${styles.settingsMenuItem} ${styles.language}`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.langsHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.langs'>Change language</Trans>
                    </div>
                </Button>
            </div>*/}

            <div className={`${styles.settingsMenuItem} ${styles.password}`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.passwordHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.password'>Change password</Trans>
                    </div>
                </Button>
            </div>

            <div className={`${styles.settingsMenuItem} ${styles.logout} margin4`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.lock}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.logOut'>Log out</Trans>
                    </div>
                </Button>
            </div>

            <Button type={BUTTON_TYPE.WARNING} onClick={this.deleteHandler}>
                <Trans i18nKey='settings.delete'>Delete all accounts</Trans>
            </Button>
        </div>
    }
}

const mapStateToProps = function() {
    return {};
};

export const Settings = connect(mapStateToProps, { lock })(SettingsComponent);
