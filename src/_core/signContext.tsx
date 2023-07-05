import clsx from 'clsx';
import { LedgerConnectModal } from 'ledger/connectModal';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import { usePopupSelector } from 'popup/store/react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Button } from 'ui/components/ui/buttons/Button';
import { Modal } from 'ui/components/ui/modal/Modal';
import Background from 'ui/services/Background';

import { Login } from '../ui/components/pages/importEmail/login';
import * as styles from './signContext.module.css';

type CreateSign = <P>(
  onConfirm: (params: P) => void,
) => (params: P) => Promise<void>;

export const SignContext = createContext<{ createSign: null | CreateSign }>({
  createSign: null,
});

function usePromiseDialogController(initiallyOpen = false) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const modalPromiseRef = useRef<null | {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }>(null);

  const open = useCallback(() => {
    setIsOpen(true);

    return new Promise((resolve, reject) => {
      modalPromiseRef.current = { resolve, reject };
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOk = useCallback((data?: unknown) => {
    modalPromiseRef.current?.resolve(data);
    modalPromiseRef.current = null;
  }, []);

  const onCancel = useCallback((reason?: unknown) => {
    setIsOpen(false);
    modalPromiseRef.current?.reject(reason);
    modalPromiseRef.current = null;
  }, []);

  return useMemo(
    () => ({
      onOk,
      onCancel,
      open,
      close,
      isOpen,
    }),
    [close, isOpen, onCancel, onOk, open],
  );
}

export function SignProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  const account = usePopupSelector(state => state.selectedAccount);

  const confirmDialog = usePromiseDialogController();

  const createSign: CreateSign = useCallback(
    onConfirm => async params => {
      switch (account?.type) {
        case 'wx':
          try {
            await Background.identityRestore(account.uuid);
            onConfirm(params);
          } catch (e) {
            await confirmDialog.open();
            await Background.identityUpdate();
            onConfirm(params);
            confirmDialog.close();
          }
          break;
        case 'ledger':
          await ledgerService.updateStatus(account.networkCode);

          if (ledgerService.status === LedgerServiceStatus.Ready) {
            onConfirm(params);
          } else {
            await confirmDialog.open();
            onConfirm(params);
            confirmDialog.close();
          }
          break;
        default:
          onConfirm(params);
          break;
      }
    },
    [account, confirmDialog],
  );

  const contextValue = useMemo(() => ({ createSign }), [createSign]);

  return (
    <>
      <SignContext.Provider value={contextValue}>
        {children}
      </SignContext.Provider>

      {account?.type === 'wx' && (
        <Modal
          showModal={confirmDialog.isOpen}
          animation={Modal.ANIMATION.FLASH}
        >
          <div className={clsx('modal', 'cover', styles.root)}>
            <div className={styles.content}>
              <Button
                className="modal-close"
                onClick={confirmDialog.onCancel}
                type="button"
                view="transparent"
              />

              <h2 className={clsx('margin4', 'title1')}>
                {t('importEmail.loginRequired')}
              </h2>

              <Login
                userData={{ username: account.username, password: '' }}
                onConfirm={confirmDialog.onOk}
              />
            </div>
          </div>
        </Modal>
      )}

      {account?.type === 'ledger' && (
        <Modal
          animation={Modal.ANIMATION.FLASH}
          showModal={confirmDialog.isOpen}
        >
          <LedgerConnectModal
            networkCode={account.networkCode}
            onClose={confirmDialog.onCancel}
            onReady={confirmDialog.onOk}
          />
        </Modal>
      )}
    </>
  );
}

export function useSign<OnConfirmParams>(
  onConfirm: (params: OnConfirmParams) => void | Promise<void>,
) {
  const [isSignPending, setIsSignPending] = useState(false);

  const { createSign } = useContext(SignContext);

  invariant(createSign);

  const sign = useCallback(
    (params: OnConfirmParams) => {
      setIsSignPending(true);

      return createSign(onConfirm)(params).finally(() =>
        setIsSignPending(false),
      );
    },
    [createSign, onConfirm],
  );

  return { sign, isSignPending };
}
