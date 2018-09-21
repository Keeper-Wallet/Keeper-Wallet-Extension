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

    render() {
        return <div className={styles.settings}>

            <div className={`left border-bottom`}>
                <Button type='transparent' onClick={this.networkHandler}>
                    <div className='body1'>
                        <Trans i18nKey='settings.network'>Network</Trans>
                    </div>
                </Button>
            </div>

            <div className={`left border-bottom`}>
                <Button type='transparent'>
                    <div className='body1'>
                        <Trans i18nKey='settings.langs'>Change language</Trans>
                    </div>
                </Button>
            </div>

            <div className={`left border-bottom`}>
                <Button type='transparent'>
                    <div className='body1'>
                        <Trans i18nKey='settings.password'>Change password</Trans>
                    </div>
                </Button>
            </div>

            <div className={`left border-bottom`}>
                <Button type='transparent' onClick={this.lock}>
                    <div className='body1'>
                        <Trans i18nKey='settings.logOut'>Log out</Trans>
                    </div>
                </Button>
            </div>

            <Button type={BUTTON_TYPE.WARNING}>
                <Trans i18nKey='settings.delete'>Delete account</Trans>
            </Button>
        </div>
    }
}

const mapStateToProps = function() {
    return {};
};

export const Settings = connect(mapStateToProps, { lock })(SettingsComponent);
