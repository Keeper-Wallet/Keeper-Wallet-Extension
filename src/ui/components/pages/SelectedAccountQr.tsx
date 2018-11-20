import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/selectedAccountQr.styl';
import { Avatar, QRCode, Button } from '../ui';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class QRCodeSelectedAccountComponent extends React.PureComponent {

    readonly props;
    qrCode: QRCode;
    getQrRef = (qr) => this.qrCode = qr;
    downloadHandler = () => this._download();

    render() {
        const address = this.props.selectedAccount.address;

        return <div className={`center ${styles.content}`}>
            <Avatar className="margin1" size={48} address={address}/>
            <div className="body1 basic500 margin4">{address}</div>
            
            <QRCode ref={this.getQrRef}
                    width={200}
                    height={200}
                    scale={16}
                    quality={1}
                    margin={1}
                    type='image/png'
                    text={address}/>

            <Button type='submit' withIcon={true} className={`${styles.downloadQr}`} onClick={this.downloadHandler}>
                <div>
                    <Trans i18nKey='qrCode.download'>Download QR code</Trans>
                </div>
            </Button>
        </div>;
    }

    _download() {
        const data = this.qrCode.getImg();
        const name = `${this.props.selectedAccount.address}.png`;
        if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
            this._downloadInMsEdge(data, name);
        } else {
            const link = document.createElement('a');
            link.setAttribute('href', data);
            link.setAttribute('download', name);
            link.setAttribute('target', '_blank');
            link.style.position = 'absolute';
            link.style.opacity = '0';
            document.body.appendChild(link);
            link.click();
            requestAnimationFrame(() => {
                document.body.removeChild(link);
            });
        }
    }

    _downloadInMsEdge(data, name) {
        const blob = new Blob([data], { type: 'image/png' });
        window.navigator.msSaveOrOpenBlob(blob, name);
    }
}

const mapStateToProps = function (store: any) {
    const activeAccount = store.selectedAccount.address;
    const selected =  store.localState.assets.account ?  store.localState.assets.account.address : activeAccount;
    const selectedAccount = store.accounts.find(({ address }) => address === selected);
    return {
        selectedAccount,
    };
};

export const QRCodeSelectedAccount = connect(mapStateToProps)(QRCodeSelectedAccountComponent);
