import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { ErrorMessage } from 'ui/components/ui/error';
import { Input } from 'ui/components/ui/input';
import { Modal } from 'ui/components/ui/modal/Modal';

import * as styles from './passwordModal.styl';

interface Props {
  showAttention?: boolean;
  showEncrypted?: boolean;
  onClose: () => void;
  onSubmit: (password: string, encrypted?: boolean) => Promise<void>;
}

export function ExportPasswordModal({
  showAttention,
  showEncrypted,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [encrypted, setEncrypted] = useState(true);

  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    if (!passwordInputRef.current) {
      return;
    }

    passwordInputRef.current.focus();
  }, []);

  return (
    <Modal animation={Modal.ANIMATION.FLASH} showModal>
      <div className="modal cover">
        <form
          className="modal-form"
          onSubmit={async event => {
            event.preventDefault();
            setPasswordError(false);
            setLoading(true);

            try {
              await onSubmit(password, encrypted);
            } catch {
              setPasswordError(true);
            }

            setLoading(false);
          }}
        >
          <i className={clsx(styles.lockIcon, 'lock-icon')} />

          <p className={clsx('margin1', 'body1', 'disabled500')}>
            {t('exportKeystore.passwordVerifyDesc')}
          </p>

          <div className="margin2 relative">
            <div className="basic500 tag1 input-title">
              {t('exportKeystore.passwordLabel')}
            </div>

            <Input
              autoComplete="current-password"
              data-testid="passwordInput"
              error={passwordError}
              forwardRef={passwordInputRef}
              type="password"
              value={password}
              view="password"
              wrapperClassName="margin1"
              onChange={event => {
                setPassword(event.currentTarget.value);
              }}
            />

            <ErrorMessage show={passwordError}>
              <div className="error">{t('exportKeystore.passwordError')}</div>
            </ErrorMessage>
          </div>

          {(showAttention || encrypted) && (
            <p className={clsx(styles.attention, 'body1', 'disabled500')}>
              <Trans
                t={t}
                components={{ attention: <strong className="error500" /> }}
                i18nKey="exportKeystore.passwordVerifyImportantNote"
              />
            </p>
          )}

          {showEncrypted && (
            <div className={styles.encrypt}>
              <p className={styles.encryptTitle}>
                {t('exportKeystore.encryptAddressBook')}
              </p>
              <input
                type="checkbox"
                checked={encrypted}
                onChange={event => {
                  setEncrypted(event.currentTarget.checked);
                }}
              />
            </div>
          )}

          <Button
            data-testid="verifyButton"
            disabled={loading || !password}
            loading={loading}
            className="margin1"
            type="submit"
            view="submit"
          >
            {t('exportKeystore.verifyBtn')}
          </Button>

          <Button type="button" onClick={onClose}>
            {t('exportKeystore.cancelBtn')}
          </Button>

          <Button
            className="modal-close"
            onClick={onClose}
            type="button"
            view="transparent"
          />
        </form>
      </div>
    </Modal>
  );
}
