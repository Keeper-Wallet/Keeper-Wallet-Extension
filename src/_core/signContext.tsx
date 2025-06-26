import clsx from 'clsx';
import { LedgerConnectModal } from 'ledger/connectModal';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import { usePopupSelector } from 'popup/store/react';
import type { PreferencesAccount } from 'preferences/types';
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
  onConfirm: (params: P) => void | Promise<void>,
) => (params: P) => Promise<void>;

interface SignContextType {
  createSign: CreateSign | null;
}
export const SignContext = createContext<SignContextType>({
  createSign: null,
});

function usePromiseDialogController(initiallyOpen = false) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  type ModalPromise = {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  };
  const modalPromiseRef = useRef<ModalPromise | null>(null);

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

  const account: PreferencesAccount | undefined = usePopupSelector(state => state.selectedAccount);

  const confirmDialog = usePromiseDialogController();

  const createSign: CreateSign = useCallback(
    onConfirm => async params => {
      if (!account) {
        onConfirm(params);
        return;
      }
      if (isWxAccount(account)) {
        try {
          await Background.identityRestore(account.uuid);
          onConfirm(params);
        } catch (e) {
          await confirmDialog.open();
          await Background.identityUpdate();
          onConfirm(params);
          confirmDialog.close();
        }
      } else if (isLedgerAccount(account)) {
        const ledgerAccount = account;
        if (ledgerAccount.networkCode) {
          await ledgerService.updateStatus(ledgerAccount.networkCode);
        }
        if (ledgerService.status === LedgerServiceStatus.Ready) {
          onConfirm(params);
        } else {
          await confirmDialog.open();
          onConfirm(params);
          confirmDialog.close();
        }
      } else {
        onConfirm(params);
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

      {isWxAccount(account) && (
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

      {isLedgerAccount(account) && (() => {
        const ledgerAccount = account;
        return (
          <Modal
            animation={Modal.ANIMATION.FLASH}
            showModal={confirmDialog.isOpen}
          >
            <LedgerConnectModal
              networkCode={ledgerAccount.networkCode}
              onClose={confirmDialog.onCancel}
              onReady={confirmDialog.onOk}
            />
          </Modal>
        );
      })()}
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

function isWxAccount(account: PreferencesAccount | undefined): account is Extract<PreferencesAccount, { type: 'wx' }> {
  return !!account && account.accountType === 'waves' && account.type === 'wx';
}

function isLedgerAccount(account: PreferencesAccount | undefined): account is PreferencesAccount & { networkCode: string; type: 'ledger' } {
  return !!account && account.accountType === 'waves' && account.type === 'ledger' && 'networkCode' in account && typeof account.networkCode === 'string';
}
