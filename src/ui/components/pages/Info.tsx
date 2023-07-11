import { Component } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';

import { BigLogo } from '../head';
import * as styles from './styles/info.styl';

class InfoComponent extends Component<WithTranslation> {
  render() {
    const { t } = this.props;

    return (
      <div className={`${styles.content} body1`}>
        <BigLogo className={`${styles.logoLeft} margin-main`} noTitle />

        <div className="margin-main basic500">{t('info.keepUp')}</div>

        <a
          rel="noopener noreferrer"
          className="link black"
          target="_blank"
          href="https://keeper-wallet.app/"
        >
          forum.waves.tech
        </a>

        <div className={`${styles.social} margin-main`}>
          <div className="margin-main basic500">{t('info.news')}</div>
          <ul>
            <li className={styles.github}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://github.com/Keeper-Wallet"
              ></a>
            </li>
            <li className={styles.telegram}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://t.me/KeeperWallet"
              ></a>
            </li>
            <li className={styles.twitter}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://twitter.com/keeperwallet"
              ></a>
            </li>
            <li className={styles.medium}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://medium.com/keeper-wallet"
              ></a>
            </li>
            <li className={styles.vk}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://vk.com/keeperwallet"
              ></a>
            </li>
          </ul>
        </div>

        <div className={`${styles.social} margin-main`}>
          <div className="margin-main basic500">{t('info.support')}</div>
          <ul>
            <li className={styles.telegram}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://t.me/KeeperCommunity"
              ></a>
            </li>
          </ul>
        </div>

        <div className="basic500">&copy; Keeper Wallet</div>
      </div>
    );
  }
}

export const Info = withTranslation()(InfoComponent);
