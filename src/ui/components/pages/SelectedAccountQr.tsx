import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import * as styles from './styles/selectedAccountQr.styl';
import { Button, Loader, QRCode } from '../ui';
import { Account } from 'accounts/types';
import { AppState } from 'ui/store';

interface Props extends WithTranslation {
  selectedAccount: Account;
}

class QRCodeSelectedAccountComponent extends React.PureComponent<Props> {
  readonly props;
  qrCode: QRCode;
  getQrRef = qr => (this.qrCode = qr);
  downloadHandler = () => this._download();

  render() {
    const { t } = this.props;
    const account = this.props.selectedAccount;
    const address = account?.address;
    const name = account?.name;
    const isEdge =
      window.navigator &&
      typeof window.navigator.msSaveOrOpenBlob === 'function';
    return (
      <div className={`center ${styles.content}`}>
        <div className="input-title fullwidth tag1">{name || <Loader />}</div>
        <div className="tag1 basic500 margin-main">{address || <Loader />}</div>

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
            type="submit"
            view="submitTiny"
            className={`${styles.downloadQr}`}
            onClick={this.downloadHandler}
          >
            <div>{t('qrCode.download')}</div>
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

const mapStateToProps = function (store: AppState) {
  const activeAccount = store.selectedAccount.address;
  const selected = store.localState.assets?.account
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
  withTranslation()(QRCodeSelectedAccountComponent)
);
