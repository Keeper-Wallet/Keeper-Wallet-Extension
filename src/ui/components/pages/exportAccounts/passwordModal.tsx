import * as styles from './passwordModal.styl';
import cn from 'classnames';
import * as React from 'react';
import { Modal } from 'ui/components/ui/modal/Modal';
import { useTranslation, Trans } from 'react-i18next';
import { Input } from 'ui/components/ui/input';
import { Error } from 'ui/components/ui/error';
import { Button } from 'ui/components/ui/buttons/Button';

interface Props {
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

export function ExportPasswordModal({ onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const passwordInputRef = React.useRef<HTMLInputElement | null>(null);
  const [password, setPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);

  React.useLayoutEffect(() => {
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

            try {
              await onSubmit(password);
            } catch {
              setPasswordError(true);
            }
          }}
        >
          <i className={cn(styles.lockIcon, 'lock-icon')} />

          <p className={cn('margin1', 'body1', 'disabled500')}>
            {t('exportKeystore.passwordVerifyDesc')}
          </p>

          <div className="margin2 relative">
            <div className="basic500 tag1 input-title">
              {t('exportKeystore.passwordLabel')}
            </div>

            <Input
              wrapperClassName="margin1"
              data-testid="passwordInput"
              error={passwordError}
              forwardRef={passwordInputRef}
              type="password"
              view="password"
              value={password}
              onChange={event => {
                setPassword(event.currentTarget.value);
              }}
            />

            <Error show={passwordError}>
              <div className="error">{t('exportKeystore.passwordError')}</div>
            </Error>
          </div>

          <p className={cn('margin2', 'body1', 'disabled500')}>
            <Trans
              t={t}
              components={{ attention: <strong className="error500" /> }}
              i18nKey="exportKeystore.passwordVerifyImportantNote"
            />
          </p>

          <Button
            data-testid="verifyButton"
            disabled={!password}
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
