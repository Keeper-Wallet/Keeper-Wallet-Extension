import clsx from 'clsx';
import { LedgerConnectModal } from 'ledger/connectModal';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import { useAppSelector } from 'popup/store/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui/components/ui';
import background from 'ui/services/Background';

import { Login } from './login';
import * as styles from './signWrapper.module.css';

type Props = {
  onConfirm: (...args: unknown[]) => void;
  children: (renderProps: {
    onPrepare: (...args: unknown[]) => void;
    pending: boolean;
  }) => React.ReactChild;
};

export function SignWrapper({ onConfirm, children }: Props) {
  const { t } = useTranslation();
  const account = useAppSelector(state => state.selectedAccount);

  const [showModal, setShowModal] = useState(false);
  const [pending, setPending] = useState(false);

  let onReadyHandler: (() => void) | undefined;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const onReady = useCallback(() => onReadyHandler!(), [onReadyHandler]);

  const onPrepare = useCallback(
    (...args: unknown[]) => {
      switch (account?.type) {
        case 'wx':
          setPending(true);

          if (typeof onReadyHandler !== 'function') {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            onReadyHandler = () =>
              background.identityUpdate().then(() => {
                onConfirm(...args);
                setShowModal(false);
                setPending(false);
              });
          }

          background
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .identityRestore(account.uuid!)
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

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ledgerService.updateStatus(account.networkCode!).then(() => {
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                userData={{ username: account.username!, password: '' }}
                onConfirm={onReady}
              />
            </div>
          </div>
        </Modal>
      )}

      {account?.type === 'ledger' && (
        <Modal animation={Modal.ANIMATION.FLASH} showModal={showModal}>
          <LedgerConnectModal
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            networkCode={account?.networkCode!}
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
