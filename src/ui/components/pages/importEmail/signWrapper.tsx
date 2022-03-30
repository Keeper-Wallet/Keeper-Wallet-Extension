import { useAppSelector } from 'ui/store';
import * as React from 'react';
import background from 'ui/services/Background';
import { Button, Modal } from 'ui/components/ui';
import cn from 'classnames';
import { Login } from './login';
import { Trans } from 'react-i18next';
import * as styles from './signWrapper.module.css';

type Props = {
  onConfirm: (...args: any) => void;
  children: (renderProps: {
    onPrepare: (...args: any) => void;
    pending: boolean;
  }) => React.ReactChild;
};

export function SignWrapper({ onConfirm, children }: Props) {
  const account = useAppSelector(state => state.selectedAccount);

  const [showModal, setShowModal] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  let onReadyHandler;
  const onReady = React.useCallback(() => onReadyHandler(), [onReadyHandler]);

  const onPrepare = React.useCallback(
    (...args: any) => {
      if (account.type !== 'wx') {
        onConfirm(...args);
        return;
      }

      setPending(true);

      if (typeof onReadyHandler !== 'function') {
        onReadyHandler = () =>
          background.identityUpdate().then(() => {
            onConfirm(...args);
            setShowModal(false);
            setPending(false);
          });
      }

      background
        .identityRestore(account.uuid)
        .then(() => {
          onConfirm(...args);
          setPending(false);
        })
        .catch(() => {
          setShowModal(true);
        });
    },
    [onConfirm, onReadyHandler]
  );

  return (
    <>
      {children({ onPrepare, pending })}

      {account.type === 'wx' && (
        <Modal showModal={showModal} animation={Modal.ANIMATION.FLASH}>
          <div className={cn('modal', 'cover', styles.root)}>
            <div className={styles.content}>
              <Button
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setPending(false);
                }}
                type="button"
                view="transparent"
              />

              <h2 className={cn('margin4', 'title1')}>
                <Trans i18nKey="importEmail.loginRequired" />
              </h2>

              <Login
                userData={{ username: account.username, password: '' }}
                onConfirm={onReady}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
