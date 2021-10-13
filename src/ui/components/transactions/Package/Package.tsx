import * as styles from './package.styl';
import * as React from 'react';
import { Trans, translate } from 'react-i18next';
import { SignClass } from '../SignClass';
import { PackageCard } from './PackageCard';
import { PackageInfo } from './PackageInfo';
import { TransactionBottom } from '../TransactionBottom';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';

@translate(I18N_NAME_SPACE)
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
        const { title } = message;
        return (
            <div className={styles.transaction}>
                <div className={`${styles.dataTxScrollBox} transactionContent`} ref={this.getContainerRef}>
                    <div className="margin-main margin-main-top headline3 basic500">
                        {title ? title : <Trans i18nKey="transactions.confirmationRequest">Confirmation request</Trans>}
                    </div>
                    <div className={`margin-main`}>
                        <PackageCard {...this.props} />
                    </div>

                    <div className="margin1 marginTop3 headline3 basic500 autoScrollToo">
                        <Trans i18nKey="transaction.details">Details</Trans>
                    </div>

                    <div className={styles.packageInfo}>
                        {' '}
                        {/* expandable container */}
                        <PackageInfo message={message} assets={assets} onToggle={this.autoScrollHandler} />
                    </div>
                </div>

                <TransactionBottom {...this.props}>
                    <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount} />
                </TransactionBottom>
            </div>
        );
    }
}
