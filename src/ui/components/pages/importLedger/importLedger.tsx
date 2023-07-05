import clsx from 'clsx';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect } from 'store/actions/localState';
import { Button } from 'ui/components/ui/buttons/Button';
import { ErrorMessage } from 'ui/components/ui/error';
import { Input } from 'ui/components/ui/input';

import { NETWORK_CONFIG } from '../../../../constants';
import { LedgerAvatarList } from './avatarList';
import * as styles from './importLedger.module.css';

const USERS_PER_PAGE = 4;
const MAX_USER_ID = 2 ** 31 - 1;
const MAX_PAGE = Math.floor(MAX_USER_ID / USERS_PER_PAGE);

interface ArrowProps {
  direction: 'left' | 'right';
}

function Arrow({ direction }: ArrowProps) {
  return (
    <svg
      className={clsx(styles.avatarListArrowSvg, {
        [styles.avatarListArrowSvgLeft]: direction === 'left',
      })}
      width="14"
      height="14"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.615 13 3.5 11.863 8.268 7 3.5 2.137 4.615 1 10.5 7l-5.885 6Z"
      />
    </svg>
  );
}

interface LedgerUser {
  address: string;
  id: number;
  path: string;
  publicKey: string;
  statusCode: string;
}

export function ImportLedger() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.accounts);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const customCodes = usePopupSelector(state => state.customCodes);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [getUsersError, setGetUsersError] = useState<
    string | React.ReactElement | null
  >(null);
  const [page, setPage] = useState(0);

  const getUsersPromiseRef = useRef(Promise.resolve());
  const [ledgerUsersPages, setLedgerUsersPages] = useState<
    Record<number, LedgerUser[]>
  >({});

  const [selectAccountError, setSelectAccountError] = useState<string | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState(0);

  const selectedUser =
    ledgerUsersPages[Math.floor(selectedUserId / USERS_PER_PAGE)]?.[
      selectedUserId % USERS_PER_PAGE
    ];

  const [userIdInputValue, setUserIdInputValue] = useState(
    String(selectedUserId),
  );

  useEffect(() => {
    setUserIdInputValue(String(selectedUserId));
    setPage(Math.floor(selectedUserId / USERS_PER_PAGE));
  }, [selectedUserId]);

  const [userIdInputError, setUserIdInputError] = useState<string | null>(null);

  useEffect(() => {
    if (!userIdInputValue) {
      return;
    }

    const userIdFromInput = Number(userIdInputValue);

    if (!isFinite(userIdFromInput)) {
      setUserIdInputError(t('importLedger.userIdInputNumbersError'));
      return;
    }

    if (userIdFromInput > MAX_USER_ID) {
      setUserIdInputError(
        t('importLedger.userIdInputMaxValueError', { maxUserId: MAX_USER_ID }),
      );
      return;
    }

    setUserIdInputError(null);

    const timeout = window.setTimeout(() => {
      setSelectedUserId(userIdFromInput);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [userIdInputValue, t]);

  const networkCode =
    customCodes[currentNetwork] || NETWORK_CONFIG[currentNetwork].networkCode;

  const connectToLedger = useCallback(async () => {
    setConnectionError(null);
    setIsConnecting(true);

    await ledgerService.connectUsb(networkCode);

    if (ledgerService.status === LedgerServiceStatus.Ready) {
      if (ledgerUsersPages[0] == null) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const users = await ledgerService.ledger!.getPaginationUsersData(
          0,
          USERS_PER_PAGE - 1,
        );

        setLedgerUsersPages({ 0: users });
      }

      setIsReady(true);
      setIsConnecting(false);
    } else {
      switch (ledgerService.status) {
        case LedgerServiceStatus.UsedBySomeOtherApp:
          setConnectionError(t('ledgerErrors.usedBySomeOtherApp'));
          break;
        default:
          setConnectionError(t('ledgerErrors.unknown'));
          break;
      }

      setIsConnecting(false);
    }
  }, [ledgerUsersPages, networkCode, t]);

  useEffect(() => {
    if (isReady) {
      return;
    }

    connectToLedger();
  }, [connectToLedger, isReady]);

  useEffect(() => {
    return () => {
      ledgerService.disconnect();
    };
  }, []);

  const isCurPageLoaded = ledgerUsersPages[page] != null;

  useEffect(() => {
    if (!isReady || isCurPageLoaded) {
      return;
    }

    setGetUsersError(null);

    getUsersPromiseRef.current = getUsersPromiseRef.current.then(() =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ledgerService
        .ledger!.getPaginationUsersData(
          page * USERS_PER_PAGE,
          USERS_PER_PAGE - 1,
        )
        .then(
          users => {
            setLedgerUsersPages(prevState => ({ ...prevState, [page]: users }));
          },
          () => {
            setGetUsersError(
              <Trans
                t={t}
                i18nKey="importLedger.couldNotGetUsersError"
                components={{
                  retryButton: (
                    <button
                      className={styles.errorRetryButton}
                      type="button"
                      onClick={connectToLedger}
                    />
                  ),
                }}
              />,
            );
            setIsReady(false);
          },
        ),
    );
  }, [connectToLedger, isCurPageLoaded, isReady, page, t]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('importLedger.title')}</h2>
      </div>

      {ledgerUsersPages[0] != null ? (
        <>
          <div className={styles.container}>
            <p className={styles.instructions}>
              {t('importLedger.selectAccountInstructions')}
            </p>

            <div className={styles.avatarList}>
              <div>
                {isCurPageLoaded ? (
                  <LedgerAvatarList
                    selectedId={selectedUserId}
                    size={38}
                    users={ledgerUsersPages[page]}
                    onSelect={id => {
                      setSelectAccountError(null);
                      setSelectedUserId(id);
                    }}
                  />
                ) : getUsersError ? (
                  <ErrorMessage className={styles.error} show>
                    {getUsersError}
                  </ErrorMessage>
                ) : (
                  t('importLedger.avatarListLoading')
                )}
              </div>

              {page > 0 && (
                <button
                  className={clsx(
                    styles.avatarListArrow,
                    styles.avatarListArrowLeft,
                  )}
                  disabled={!isCurPageLoaded}
                  type="button"
                  onClick={() => {
                    setPage(prevState => prevState - 1);
                  }}
                >
                  <Arrow direction="left" />
                </button>
              )}

              {page < MAX_PAGE && (
                <button
                  className={clsx(
                    styles.avatarListArrow,
                    styles.avatarListArrowRight,
                  )}
                  disabled={!isCurPageLoaded}
                  type="button"
                  onClick={() => {
                    setPage(prevState => prevState + 1);
                  }}
                >
                  <Arrow direction="right" />
                </button>
              )}
            </div>

            <ErrorMessage className={styles.error} show={!!selectAccountError}>
              {selectAccountError}
            </ErrorMessage>

            <div className="margin2">
              <div className="tag1 basic500 input-title">
                {t('importLedger.accountIdLabel')}
              </div>

              <Input
                value={userIdInputValue}
                onBlur={() => {
                  setUserIdInputValue(String(selectedUserId));
                }}
                onChange={event => {
                  setUserIdInputValue(event.currentTarget.value);
                }}
              />

              <ErrorMessage show={userIdInputError != null}>
                {userIdInputError}
              </ErrorMessage>
            </div>
          </div>

          <div className={clsx(styles.address, 'grey-line')}>
            {selectedUser?.address}
          </div>

          <div className={styles.container}>
            <Button
              disabled={!selectedUser}
              view="submit"
              onClick={() => {
                if (
                  accounts.some(acc => acc.address === selectedUser.address)
                ) {
                  setSelectAccountError(t('importLedger.accountExistsError'));
                  return;
                }

                dispatch(
                  newAccountSelect({
                    type: 'ledger',
                    address: selectedUser.address,
                    id: selectedUser.id,
                    publicKey: selectedUser.publicKey,
                    name: '',
                    hasBackup: true,
                  }),
                );

                navigate('/account-name');
              }}
            >
              {t('importLedger.continueButton')}
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.container}>
          <p className={styles.instructions}>
            {t('importLedger.connectInstructions')}
          </p>

          <ErrorMessage className={styles.error} show={!!connectionError}>
            {connectionError}
          </ErrorMessage>

          {isConnecting ? (
            <div className={styles.loader} />
          ) : (
            <Button
              disabled={isConnecting}
              view="submit"
              onClick={connectToLedger}
            >
              {t('importLedger.tryAgainButton')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
