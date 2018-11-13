import * as styles from './styles/welcome.styl';
import * as React from 'react'
import { BigLogo } from '../head';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { PAGES } from '../../pageConfig';

@translate('extension')
export class Welcome extends React.Component {
    
    readonly props;
    clickHandler = () => this.props.setTab(PAGES.CONDITIONS);
    
    render() {
        return <div className={`${styles.content}`}>
            <BigLogo className="margin-main-large" />
            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.clickHandler} className="margin-main-big">
                <Trans i18nKey='welcome.getStarted'>Get Started</Trans>
            </Button>
            <div className="basic500 body3">
                <div><Trans i18nKey='welcome.info'>Waves Keeper — is the safest way to interact with third-party web resources with Waves-integrated functionality or DApps.</Trans></div>
                <div><Trans i18nKey='welcome.info2'>Using Waves Keeper, you can sign transactions and remain safe from malicious sites.</Trans></div>
            </div>
        </div>
    }
}
