import { usePopupSelector } from 'popup/store/react';
import QrCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../ui/buttons/Button';
import { Loader } from '../ui/loader/Loader';
import * as styles from './SelectedAccountQr.module.css';

export function SelectedAccountQr() {
  const { t } = useTranslation();
  const selectedAccount = usePopupSelector(state => state.selectedAccount);

  const address = selectedAccount?.address;
  const name = selectedAccount?.name;

  const [qrSrc, setQrSrc] = useState<string>();
  const qrSize = 200;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    QrCode.toDataURL(address!, {
      errorCorrectionLevel: 'H',
      margin: 1,
      rendererOpts: { quality: 1 },
      scale: 16,
      type: 'image/jpeg',
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
        disabled={!qrSrc}
        view="submitTiny"
        onClick={() => {
          if (!qrSrc) {
            return;
          }

          const link = document.createElement('a');
          link.setAttribute('href', qrSrc);
          link.setAttribute('download', `${selectedAccount?.address}.png`);
          link.click();
        }}
      >
        {t('qrCode.download')}
      </Button>
    </div>
  );
}
