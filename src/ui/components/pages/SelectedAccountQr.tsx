import * as QrCode from 'qrcode';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'ui/store';
import { Button } from '../ui/buttons/Button';
import { Loader } from '../ui/loader/Loader';
import * as styles from './SelectedAccountQr.module.css';

export function SelectedAccountQr() {
  const { t } = useTranslation();
  const selectedAccount = useAppSelector(state => state.selectedAccount);

  const address = selectedAccount?.address;
  const name = selectedAccount?.name;

  const [qrSrc, setQrSrc] = React.useState<string | null>(null);
  const qrSize = 200;

  React.useEffect(() => {
    QrCode.toDataURL(address, {
      errorCorrectionLevel: 'H',
      margin: 1,
      rendererOpts: { quality: 1 },
      scale: 16,
      type: 'image/png',
      width: qrSize,
    }).then(setQrSrc);
  }, [address]);

  return (
    <div className={styles.content}>
      <div className="input-title fullwidth tag1">{name || <Loader />}</div>
      <div className="tag1 basic500 margin-main">{address || <Loader />}</div>

      <div>
        <img
          className={qrSrc ? undefined : 'skeleton-glow'}
          src={qrSrc}
          width={qrSize}
          height={qrSize}
        />
      </div>

      <Button
        className={styles.downloadQr}
        view="submitTiny"
        onClick={() => {
          const link = document.createElement('a');
          link.setAttribute('href', qrSrc);
          link.setAttribute('download', `${selectedAccount.address}.png`);
          link.click();
        }}
      >
        {t('qrCode.download')}
      </Button>
    </div>
  );
}
