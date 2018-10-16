import * as styles from './styles/welcome.styl';
import * as React from 'react'
import { BigLogo } from '../head';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { PAGES } from '../../pageConfig';

@translate('extension')
export class Welcome extends React.Component {
    
    readonly props;
    clickHandler = () => this.props.setTab(PAGES.NEW);
    
    render() {
        return <div className={styles.content}>
            <BigLogo/>
            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.clickHandler}>
                <Trans i18nKey='welcome.getStarted'>Get Started</Trans>
            </Button>
            <div>
                <Trans i18nKey='welcome.info'>Waves Keeper – some powerful text.</Trans>
                <Trans i18nKey='welcome.info2'>Allows you to store ether and tokens and serves as a bridge to decentralized applications.</Trans>
            </div>
        </div>
    }
}
