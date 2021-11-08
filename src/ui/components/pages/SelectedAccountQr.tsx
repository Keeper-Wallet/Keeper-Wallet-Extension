import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import * as styles from './styles/selectedAccountQr.styl';
import { Button, QRCode } from '../ui';

class QRCodeSelectedAccountComponent extends React.PureComponent {
  readonly props;
  qrCode: QRCode;
  getQrRef = qr => (this.qrCode = qr);
  downloadHandler = () => this._download();

  render() {
    const address = this.props.selectedAccount.address;
    const name = this.props.selectedAccount.name;
    const isEdge =
      window.navigator &&
      typeof window.navigator.msSaveOrOpenBlob === 'function';
    return (
      <div className={`center ${styles.content}`}>
        <div className="input-title fullwidth tag1">{name}</div>
        <div className="tag1 basic500 margin-main">{address}</div>

        <QRCode
          ref={this.getQrRef}
          width={200}
          height={200}
          scale={16}
          quality={1}
          margin={1}
          type="image/png"
          text={address}
        />

        {isEdge ? null : (
          <Button
            type="submitTiny"
            className={`${styles.downloadQr}`}
            onClick={this.downloadHandler}
          >
            <div>
              <Trans i18nKey="qrCode.download">Download QR code</Trans>
            </div>
          </Button>
        )}
      </div>
    );
  }

  _download() {
    const data = this.qrCode.getImg();
    const name = `${this.props.selectedAccount.address}.png`;

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

const mapStateToProps = function (store: any) {
  const activeAccount = store.selectedAccount.address;
  const selected = store.localState.assets.account
    ? store.localState.assets.account.address
    : activeAccount;
  const selectedAccount = store.accounts.find(
    ({ address }) => address === selected
  );
  return {
    selectedAccount,
  };
};

export const QRCodeSelectedAccount = connect(mapStateToProps)(
  QRCodeSelectedAccountComponent
);
