import * as styles from './styles/info.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { BigLogo } from '../head';

export class Info extends React.Component {
  render() {
    return (
      <div className={`${styles.content} body1`}>
        <BigLogo className={`${styles.logoLeft} margin-main`} noTitle={true} />

        <div className="margin-main basic500">
          <Trans i18nKey="info.keepUp">
            Keeper Wallet — is the safest way to interact with third-party web
            resources with Waves-integrated functionality or DApps. Using Waves
            Keeper, you can sign transactions and remain safe from malicious
            sites.
          </Trans>
        </div>

        <a
          rel="noopener noreferrer"
          className="link black"
          target="_blank"
          href="https://forum.waves.tech"
        >
          forum.waves.tech
        </a>

        <div className={`${styles.social} margin-main`}>
          <div className="margin-main basic500">
            <Trans i18nKey="info.joinUs">Join the Waves Community</Trans>
          </div>
          <ul>
            <li className={styles.github}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://github.com/wavesplatform"
              ></a>
            </li>
            <li className={styles.telegram}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://t.me/wavesnews"
              ></a>
            </li>
            <li className={styles.discord}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://discordapp.com/invite/cnFmDyA"
              ></a>
            </li>
            <li className={styles.twitter}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://twitter.com/wavesprotocol"
              ></a>
            </li>
            <li className={styles.reddit}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.reddit.com/r/Wavesplatform"
              ></a>
            </li>
            <li className={styles.medium}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://medium.com/wavesprotocol"
              ></a>
            </li>
            <li className={styles.youtube}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.youtube.com/channel/UCYDQN4Fo4rGnOZ22L5plNIw/featured"
              ></a>
            </li>
            <li className={styles.vk}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://vk.com/wavesprotocol"
              ></a>
            </li>
          </ul>
        </div>

        <div className="basic500">&copy; Waves</div>
      </div>
    );
  }
}
