import * as styles from './styles/welcome.styl';
import * as React from 'react';
import { BigLogo } from '../head';
import { Trans } from 'react-i18next';
import { Button, ButtonType, ButtonView } from '../ui';
import { PAGES } from '../../pageConfig';

interface IWelcomeProps {
  setTab(tab: string): void;
}

export class Welcome extends React.Component<IWelcomeProps> {
  clickHandler = (e: React.MouseEvent): void => {
    e.preventDefault();
    this.props.setTab(PAGES.NEW);
  };

  render() {
    return (
      <div className={`${styles.content}`}>
        <BigLogo className="margin-main-large" />
        <Button
          type={ButtonType.SUBMIT}
          view={ButtonView.SUBMIT}
          onClick={this.clickHandler}
          className="margin-main-big"
        >
          <Trans i18nKey="welcome.getStarted">Get Started</Trans>
        </Button>
        <div className="basic500 body3">
          <div>
            <Trans i18nKey="welcome.info">
              Waves Keeper — is the safest way to interact with third-party web
              resources with Waves-integrated functionality or DApps.
            </Trans>
          </div>
          <div>
            <Trans i18nKey="welcome.info2">
              Using Waves Keeper, you can sign transactions and remain safe from
              malicious sites.
            </Trans>
          </div>
        </div>
      </div>
    );
  }
}
