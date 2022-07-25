import cn from 'classnames';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { newAccountSelect } from 'ui/actions/localState';
import { Button } from 'ui/components/ui/buttons/Button';
import { Error } from 'ui/components/ui/error';
import { Input } from 'ui/components/ui/input';
import { PAGES } from 'ui/pageConfig';
import { useAppDispatch, useAppSelector } from 'ui/store';
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
      className={cn(styles.avatarListArrowSvg, {
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

interface Props {
  setTab: (newTab: string) => void;
}

export function ImportLedger({ setTab }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);

  const [isConnecting, setIsConnecting] = React.useState(false);
  const [connectionError, setConnectionError] = React.useState<string | null>(
    null
  );
  const [isReady, setIsReady] = React.useState(false);

  const [getUsersError, setGetUsersError] = React.useState<
    string | React.ReactElement | null
  >(null);
  const [page, setPage] = React.useState(0);

  const getUsersPromiseRef = React.useRef(Promise.resolve());
  const [ledgerUsersPages, setLedgerUsersPages] = React.useState<
    Record<number, LedgerUser[]>
  >({});

  const [selectAccountError, setSelectAccountError] = React.useState<
    string | null
  >(null);
  const [selectedUserId, setSelectedUserId] = React.useState(0);

  const selectedUser =
    ledgerUsersPages[Math.floor(selectedUserId / USERS_PER_PAGE)]?.[
      selectedUserId % USERS_PER_PAGE
    ];

  const [userIdInputValue, setUserIdInputValue] = React.useState(
    String(selectedUserId)
  );

  React.useEffect(() => {
    setUserIdInputValue(String(selectedUserId));
    setPage(Math.floor(selectedUserId / USERS_PER_PAGE));
  }, [selectedUserId]);

  const [userIdInputError, setUserIdInputError] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
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
        t('importLedger.userIdInputMaxValueError', { maxUserId: MAX_USER_ID })
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
    customCodes[currentNetwork] ||
    networks.find(n => currentNetwork === n.name).code;

  const connectToLedger = React.useCallback(async () => {
    setConnectionError(null);
    setIsConnecting(true);

    await ledgerService.connectUsb(networkCode);

    if (ledgerService.status === LedgerServiceStatus.Ready) {
      if (ledgerUsersPages[0] == null) {
        const users = await ledgerService.ledger.getPaginationUsersData(
          0,
          USERS_PER_PAGE - 1
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

  React.useEffect(() => {
    if (isReady) {
      return;
    }

    connectToLedger();
  }, [connectToLedger, isReady]);

  React.useEffect(() => {
    return () => {
      ledgerService.disconnect();
    };
  }, []);

  const isCurPageLoaded = ledgerUsersPages[page] != null;

  React.useEffect(() => {
    if (!isReady || isCurPageLoaded) {
      return;
    }

    setGetUsersError(null);

    getUsersPromiseRef.current = getUsersPromiseRef.current.then(() =>
      ledgerService.ledger
        .getPaginationUsersData(page * USERS_PER_PAGE, USERS_PER_PAGE - 1)
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
              />
            );
            setIsReady(false);
          }
        )
    );
  }, [connectToLedger, isCurPageLoaded, isReady, page, t]);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{t('importLedger.title')}</h2>

      {ledgerUsersPages[0] != null ? (
        <div>
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
                <Error className={styles.error} show>
                  {getUsersError}
                </Error>
              ) : (
                t('importLedger.avatarListLoading')
              )}
            </div>

            {page > 0 && (
              <button
                className={cn(
                  styles.avatarListArrow,
                  styles.avatarListArrowLeft
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
                className={cn(
                  styles.avatarListArrow,
                  styles.avatarListArrowRight
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

          <Error className={styles.error} show={!!selectAccountError}>
            {selectAccountError}
          </Error>

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

            <Error show={userIdInputError != null}>{userIdInputError}</Error>
          </div>

          <div className={cn(styles.address, 'grey-line')}>
            {selectedUser?.address}
          </div>

          <Button
            disabled={!selectedUser}
            view="submit"
            onClick={() => {
              if (accounts.some(acc => acc.address === selectedUser.address)) {
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
                })
              );

              setTab(PAGES.ACCOUNT_NAME_SEED);
            }}
          >
            {t('importLedger.continueButton')}
          </Button>
        </div>
      ) : (
        <div>
          <p className={styles.instructions}>
            {t('importLedger.connectInstructions')}
          </p>

          <Error className={styles.error} show={!!connectionError}>
            {connectionError}
          </Error>

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
