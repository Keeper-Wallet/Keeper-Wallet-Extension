import * as styles from './styles/settings.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE, PowerButton } from '../ui/buttons';
import { lock, setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class SettingsComponent extends React.Component {

    readonly props;
    lock = () => {
        this.props.setTab(null);
        this.props.lock();
    };
    networkHandler = () => this.props.setTab(PAGES.NETWORK_SETTINGS);
    langsHandler = () => this.props.setTab(PAGES.LANGS_SETTINGS);
    permissionsHandler = () => this.props.setTab(PAGES.PERMISSIONS);
    passwordHandler = () => this.props.setTab(PAGES.CHANGE_PASSWORD);
    deleteHandler = () => this.props.setTab(PAGES.DELETE_ACCOUNT);
    pairingHandler = () => this.props.setTab(PAGES.PAIRING);
    toggleAutoLockHandler = () => {
        this.props.setUiState({ autoClickProtection: !this.props.autoClickProtection });
    };

    render() {
        return <div className={styles.content}>

            <div className={`${styles.title1} title1`}>
                <Trans i18nKey='settings.settings'>Settings</Trans>
            </div>

            <div className={`${styles.settingsMenuItem} ${styles.network}`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.networkHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.network'>Network</Trans>
                    </div>
                </Button>
            </div>
    
            <div className={`${styles.settingsMenuItem} ${styles.permissions}`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.permissionsHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.permissionsControl'>Permissions control</Trans>
                    </div>
                </Button>
            </div>
            
            {/*<div className={`${styles.settingsMenuItem} ${styles.pairing}`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.pairingHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.pairing'>Device Pairing</Trans>
                    </div>
                </Button>
            </div>
            
            <div className={`${styles.settingsMenuItem} ${styles.language}`}>
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

            <div className={`${styles.clickProtection} tag1` }>
                <PowerButton onClick={this.toggleAutoLockHandler} enabled={this.props.autoClickProtection}/>
                <div className={`${styles.powerBtnState} left`}>
                    <div>
                        <Trans i18nKey='settings.autoClick'>Auto-click protection</Trans>
                    </div>
                    <div className="submit400">
                        {
                            !this.props.autoClickProtection ?
                                <Trans i18nKey='settings.autoClickDisable'>Disabled</Trans> :
                                <Trans i18nKey='settings.autoClickEnable'>Enabled</Trans>
                        }
                    </div>
                </div>
                <div>
                    <div className={styles.helper}>
                        <i className={styles.helpIcon}>?</i>
                        <div className={styles.tooltip}>
                            <Trans i18nKey='settings.toolitpContent'>Protect yourself from Clicker Trojans threats</Trans>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles.settingsFooter} tag1`}>
                <div className={styles.buttonsWrapper}>
                    <div>
                        <div className={styles.deleteAccounts} onClick={this.deleteHandler}>
                            <i className={styles.icon}></i>
                            <span><Trans i18nKey='settings.deleteAccounts'>Delete accounts</Trans></span>
                        </div>
                    </div>
                    <div>
                        <div className={styles.logout} onClick={this.lock}>
                            <i className={styles.icon}></i>
                            <span><Trans i18nKey='settings.logOut'>Log out</Trans></span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    }
}

const mapStateToProps = function(store) {
    return {
        autoClickProtection: store.uiState && store.uiState.autoClickProtection
    };
};

export const Settings = connect(mapStateToProps, { lock, setUiState })(SettingsComponent);
