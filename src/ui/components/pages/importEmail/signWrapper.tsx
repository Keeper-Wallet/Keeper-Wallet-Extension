import clsx from 'clsx';
import { LedgerConnectModal } from 'ledger/connectModal';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import { usePopupSelector } from 'popup/store/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { Modal } from 'ui/components/ui/modal/Modal';
import Background from 'ui/services/Background';

import { Login } from './login';
import * as styles from './signWrapper.module.css';

interface Props<F extends (...args: unknown[]) => void> {
  children: (renderProps: {
    pending: boolean;
    onPrepare: (...args: Parameters<F>) => void;
  }) => React.ReactElement | string | number;
  onConfirm: F;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SignWrapper<F extends (...args: any[]) => void>({
  children,
  onConfirm,
}: Props<F>) {
  const { t } = useTranslation();
  const account = usePopupSelector(state => state.selectedAccount);

  const [showModal, setShowModal] = useState(false);
  const [pending, setPending] = useState(false);

  let onReadyHandler: (() => void) | undefined;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const onReady = useCallback(() => onReadyHandler!(), [onReadyHandler]);

  const onPrepare = useCallback(
    (...args: Parameters<F>) => {
      switch (account?.type) {
        case 'wx':
          setPending(true);

          if (typeof onReadyHandler !== 'function') {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            onReadyHandler = () =>
              Background.identityUpdate().then(() => {
                onConfirm(...args);
                setShowModal(false);
                setPending(false);
              });
          }

          Background.identityRestore(account.uuid)
            .then(() => {
              onConfirm(...args);
              setPending(false);
            })
            .catch(() => {
              setShowModal(true);
            });
          break;
        case 'ledger':
          setPending(true);

          if (typeof onReadyHandler !== 'function') {
            onReadyHandler = () => {
              onConfirm(...args);
              setShowModal(false);
              setPending(false);
            };
          }

          ledgerService.updateStatus(account.networkCode).then(() => {
            if (ledgerService.status === LedgerServiceStatus.Ready) {
              setPending(false);
              onConfirm(...args);
            } else {
              setShowModal(true);
            }
          });
          break;
        default:
          onConfirm(...args);
          break;
      }
    },
    [onConfirm, onReadyHandler]
  );

  return (
    <>
      {children({ onPrepare, pending })}

      {account?.type === 'wx' && (
        <Modal showModal={showModal} animation={Modal.ANIMATION.FLASH}>
          <div className={clsx('modal', 'cover', styles.root)}>
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

              <h2 className={clsx('margin4', 'title1')}>
                {t('importEmail.loginRequired')}
              </h2>

              <Login
                userData={{ username: account.username, password: '' }}
                onConfirm={onReady}
              />
            </div>
          </div>
        </Modal>
      )}

      {account?.type === 'ledger' && (
        <Modal animation={Modal.ANIMATION.FLASH} showModal={showModal}>
          <LedgerConnectModal
            networkCode={account.networkCode}
            onClose={() => {
              setShowModal(false);
              setPending(false);
            }}
            onReady={onReady}
          />
        </Modal>
      )}
    </>
  );
}
