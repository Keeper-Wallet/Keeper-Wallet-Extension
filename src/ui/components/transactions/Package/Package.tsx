import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './package.styl';
import { PackageCard } from './PackageCard';
import { PackageInfo } from './PackageInfo';

interface State {
  needScroll: boolean;
}

class PackageComponent extends PureComponent<
  MessageComponentProps & WithTranslation
> {
  readonly state: State = { needScroll: false };
  container: HTMLDivElement | null | undefined;
  needScroll: false | undefined;

  getContainerRef = (ref: HTMLDivElement | null) => {
    this.container = ref;
  };

  autoScrollHandler = (isShow: boolean) => {
    this.setState({ needScroll: isShow });
  };

  componentDidUpdate(): void {
    if (!this.state.needScroll) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const element = this.container!.querySelector('.autoScrollToo')!;
    const to = element.getBoundingClientRect().top;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.container!.scroll({
      top: to - 60,
      behavior: 'smooth',
    });
    this.setState({ needScroll: false });
  }

  render() {
    const { t, message, assets } = this.props;

    return (
      <div className={styles.transaction}>
        <TxHeader {...this.props} />

        <div
          className={`${styles.dataTxScrollBox} transactionContent`}
          ref={this.getContainerRef}
        >
          <div className="margin-main">
            <PackageCard {...this.props} />
          </div>

          <div className="margin1 marginTop3 headline3 basic500 autoScrollToo">
            {t('transactions.details')}
          </div>

          <div className={styles.packageInfo}>
            {/* expandable container */}
            <PackageInfo
              message={message}
              assets={assets}
              onToggle={this.autoScrollHandler}
            />
          </div>
        </div>

        <TxFooter {...this.props} />
      </div>
    );
  }
}

export const Package = withTranslation()(PackageComponent);
