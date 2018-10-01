import * as styles from './styles/info.styl';
import * as React from 'react';
import {Trans, translate} from 'react-i18next';
import {BigLogo} from '../head';

@translate('extension')
export class Info extends React.Component {

    render() {
        return <div className={`${styles.content} body1`}>
            <BigLogo className={`${styles.logoLeft} margin-main`} noTitle={true}/>

            <div className="margin-main basic500">
                <Trans i18nKey='info.keepUp'>
                    Keep up with the latest news and
                    articles, and find out all about events
                    happening on the Waves Platform</Trans>
            </div>

            <a className="link black" target='_blank' href='https://wavescommunity.com'>wavescommunity.com</a>

            <div className={`${styles.social} margin-main`}>
                <div className="margin-main basic500">
                    <Trans i18nKey='info.joinUs'>Join the Waves Community</Trans>
                </div>
                <ul>
                    <li className={styles.github}><a target="_blank" href="https://github.com/wavesplatform/"></a></li>
                    <li className={styles.telegram}><a target="_blank" href="https://telegram.me/wavesnews"></a></li>
                    <li className={styles.discord}><a target="_blank" href="https://discord.gg/cnFmDyA"></a></li>
                    <li className={styles.twitter}><a target="_blank" href="https://twitter.com/wavesplatform"></a></li>
                    <li className={styles.facebook}><a target="_blank" href="https://www.facebook.com/wavesplatform"></a></li>
                </ul>
            </div>

            <div className="basic500">&copy; Waves Platform</div>

        </div>;
    }
}
