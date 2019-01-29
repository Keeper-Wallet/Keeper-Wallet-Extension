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
            
            <div className={`${styles.settingsMenuItem} ${styles.logout} margin4`}>
                <Button type='transparent'
                        className={styles.settingsBtn}
                        onClick={this.lock}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.logOut'>Log out</Trans>
                    </div>
                </Button>
            </div>
    
            <div className={`${styles.settingsMenuItem} margin4`}>
                <PowerButton onClick={this.toggleAutoLockHandler} enabled={!this.props.autoClickProtection}/>
                <div className='body1 left'>
                    <Trans i18nKey='settings.autoClick'>Auto-click protection</Trans>
                    <div>
                        {
                            this.props.autoClickProtection ?
                                <Trans i18nKey='settings.autoClickDisable'>Disabled</Trans> :
                                <Trans i18nKey='settings.autoClickEnable'>Enabled</Trans>
                        }
                    </div>
                </div>
            </div>

            <Button type={BUTTON_TYPE.WARNING} onClick={this.deleteHandler}>
                <Trans i18nKey='settings.delete'>Delete all accounts</Trans>
            </Button>
        </div>
    }
}

const mapStateToProps = function(store) {
    return {
        autoClickProtection: store.uiState && store.uiState.autoClickProtection
    };
};

export const Settings = connect(mapStateToProps, { lock, setUiState })(SettingsComponent);
