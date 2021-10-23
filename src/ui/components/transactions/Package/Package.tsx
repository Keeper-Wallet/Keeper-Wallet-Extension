import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';

import { PackageCard } from './PackageCard';
import { PackageInfo } from './PackageInfo';
import { TxFooter, TxHeader } from '../BaseTransaction';
import { SignClass } from '../SignClass';

export class Package extends SignClass {
    readonly state = { needScroll: false };
    container: HTMLDivElement;
    needScroll: false;

    getContainerRef = (ref) => {
        this.container = ref;
    };

    autoScrollHandler = (isShow) => {
        this.setState({ needScroll: isShow });
    };

    componentDidUpdate(): void {
        if (!this.state.needScroll) {
            return null;
        }

        const element = this.container.querySelector('.autoScrollToo');
        const to = element.getBoundingClientRect().top;
        this.container.scroll({
            top: to - 60,
            behavior: 'smooth',
        });
        this.setState({ needScroll: false });
    }

    render() {
        const { message, assets } = this.props;

        return (
            <div className={styles.transaction}>
                <TxHeader {...this.props} />

                <div className={`${styles.dataTxScrollBox} transactionContent`} ref={this.getContainerRef}>
                    <div className={`margin-main`}>
                        <PackageCard {...this.props} />
                    </div>

                    <div className="margin1 marginTop3 headline3 basic500 autoScrollToo">
                        <Trans i18nKey="transactions.details" />
                    </div>

                    <div className={styles.packageInfo}>
                        {/* expandable container */}
                        <PackageInfo message={message} assets={assets} onToggle={this.autoScrollHandler} />
                    </div>
                </div>

                <TxFooter {...this.props} />
            </div>
        );
    }
}
