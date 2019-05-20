import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/pairingAccountQr.styl';
import {QRCode} from '../ui';
import {pairingGetData, pairingSetData} from '../../actions';
import {I18N_NAME_SPACE} from '../../appConfig';
import {TransactionWallet} from '../wallets';
import {PAGES} from '../../pageConfig';
import {Intro} from './Intro';
import cn from 'classnames';

const SIZE = {
    MIN: 200,
    MAX: 280
};

@translate(I18N_NAME_SPACE)
class PairingAccountQrComponent extends React.PureComponent {

    readonly state = {setBig: false};
    readonly props;

    selectAccountHandler = () => this.selectAccount();

    private clickHandler = () => {
        const setBig = !this.state.setBig;
        this.setState({setBig});
    };


    componentDidMount(): void {
        this.props.pairingGetData(this.props.selectedAccount.address);
    }

    selectAccount() {
        this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);
    }

    render() {

        if (this.props.loading || !this.props.seed) {
            return <Intro/>;
        }

        const seed = this.props.seed;
        const name = this.props.selectedAccount.name;
        const address = this.props.selectedAccount.address;
        const {setBig} = this.state;
        const size = setBig ? SIZE.MAX : SIZE.MIN;
        const rootClassName = cn(styles.content, 'center', {
            [styles.big]: setBig
        });

        const pairingData = `waves://export/${address}?encryptedSeed=${seed}&name=${name}`;

        return <div className={rootClassName}>
            <div className={styles.walletInfo}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.selectAccountHandler}/>
            </div>

            <div className={styles.pairingWrapper}>
                <h2 className={cn('title1', 'margin3', 'margin-main-big', styles.title)}>
                    <Trans i18nKey='pairing.scanPairing'>Scan Pairing Code</Trans>
                </h2>

                <div className={`${styles.qrCode} margin-main-big`} onClick={this.clickHandler}>
                    <QRCode width={size}
                            height={size}
                            scale={16}
                            quality={1}
                            margin={1}
                            type='svg'
                            text={pairingData}/>
                </div>

                <div className={`fixed ${styles.pairingFooter}`}>
                    <div className="margin-main-big body1 basic500">
                        <Trans i18nKey="pairing.scanInfo">
                            Scan the code below with your iPhone or Android device to pair it with your account.
                        </Trans>
                    </div>
                    <div className="margin-main body1 basic500">
                        <Trans i18nKey="pairing.appInfo">
                            Download our mobile applications below:
                        </Trans>
                    </div>

                    <div className="buttons-wrapper margin-main-large">
                        <a rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=com.wavesplatform.wallet" className="google-play-btn" target="_blank"></a>
                        <a rel="noopener noreferrer" href="https://itunes.apple.com/us/app/waves-wallet/id1233158971?mt=8" className="apple-store-btn" target="_blank"></a>
                    </div>
                </div>

            </div>
        </div>;
    }
}

const mapStateToProps = function (store: any) {
    const activeAccount = store.selectedAccount.address;
    const selected = store.localState.assets.account ? store.localState.assets.account.address : activeAccount;
    const selectedAccount = store.accounts.find(({address}) => address === selected);
    const {pairing} = store.localState;
    return {
        selectedAccount,
        loading: pairing.loading,
        seed: pairing.seed,
    };
};

const actions = {
    pairingSetData,
    pairingGetData
};

export const PairingAccountQr = connect(mapStateToProps, actions)(PairingAccountQrComponent);
