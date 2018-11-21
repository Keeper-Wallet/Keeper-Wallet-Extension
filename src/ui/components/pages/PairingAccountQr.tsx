import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/pairingAccountQr.styl';
import { QRCode } from '../ui';
import { pairingGetData, pairingSetData } from '../../actions';
import { I18N_NAME_SPACE } from '../../appConfig';
import { TransactionWallet } from '../wallets';
import { PAGES } from '../../pageConfig';
import { Intro } from './Intro';

const SIZE = {
    MIN: 200,
    MAX: 340
};

@translate(I18N_NAME_SPACE)
class PairingAccountQrComponent extends React.PureComponent {

    readonly state = { size: SIZE.MIN };
    readonly props;
    qrCode: QRCode;  
    
    selectAccountHandler = () => this.selectAccount();
    
    private clickHandler = () => {
        const size = this.state.size === SIZE.MIN ? SIZE.MAX :SIZE.MIN;
        this.setState({ size });
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
        
        const pairingData = `waves://export/${address}?encryptedSeed=${seed}&name=${name}`;
        
        return <div className={`center ${styles.content}`}>
            <div>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.selectAccountHandler}/>
            </div>
            
            <div>
                <Trans i18nKey='pairing.scanPairing'>Scan Pairing Code</Trans>
            </div>
            
            <div className={styles.qrCode} onClick={this.clickHandler}>
                <QRCode width={this.state.size}
                        height={this.state.size}
                        scale={16}
                        quality={1}
                        margin={1}
                        type='svg'
                        text={pairingData}/>
            </div>
            
            <div>
                <Trans i18nKey="pairing.scanInfo">
                    Scan the code below with your iPhone or Android device to pair it with your account.
                </Trans>
    
                <Trans i18nKey="pairing.appInfo">
                    Download our mobile applications below:
                </Trans>
            </div>
            
            <div>
                <a href="#" target="_blank">Google Play</a>
                <a href="#" target="_blank">Apple Store</a>
            </div>
        </div>;
    }
}

const mapStateToProps = function (store: any) {
    const activeAccount = store.selectedAccount.address;
    const selected =  store.localState.assets.account ?  store.localState.assets.account.address : activeAccount;
    const selectedAccount = store.accounts.find(({ address }) => address === selected);
    const { pairing } = store.localState;
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
