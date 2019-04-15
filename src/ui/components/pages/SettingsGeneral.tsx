import * as styles from './styles/settings.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE, Select } from '../ui';
import { lock, setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class SettingsGeneralComponent extends React.Component {

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
        
        const selectList = [
            {
                id: 'idle',
                text: 'Idle mode',
                value: 'idle',
            },
            {
                id: '5m',
                text: '5 min',
                value: 5 * 1000 * 60,
            },
            {
                id: '10m',
                text: '10 min',
                value: 10 * 1000 * 60,
            },
            {
                id: '20m',
                text: '20 min',
                value: 20 * 1000 * 60,
            },
            {
                id: '40m',
                text: '40 min',
                value: 40 * 1000 * 60,
            },
            {
                id: '1h',
                text: '1 hour',
                value: 60 * 1000 * 60,
            }
        ];
        
        return <div className={styles.content}>

            <div className={`${styles.title1} title1`}>
                <Trans i18nKey='settings.settings'>Settings</Trans>
            </div>

            <div>
                <div>
                    <Select description={<Trans i18nKey='settings.sessionTimeout'>Session Timeout in</Trans>}
                            selectList={selectList as any}
                            selected={'idle'}
                    >
                    
                    </Select>
                </div>
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
                <Button type={BUTTON_TYPE.TRANSPARENT}
                        className={styles.settingsBtn}
                        onClick={this.passwordHandler}>
                    <div className='body1 left'>
                        <Trans i18nKey='settings.password'>Change password</Trans>
                    </div>
                </Button>
            </div>

        </div>
    }
}

const mapStateToProps = function(store) {
    return {
        autoClickProtection: store.uiState && store.uiState.autoClickProtection
    };
};

export const SettingsGeneral = connect(mapStateToProps, { lock, setUiState })(SettingsGeneralComponent);
