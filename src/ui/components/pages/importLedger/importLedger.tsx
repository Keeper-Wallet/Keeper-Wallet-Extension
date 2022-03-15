import cn from 'classnames';
import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { newAccountSelect } from 'ui/actions/localState';
import { AvatarList } from 'ui/components/ui/avatar/AvatarList';
import { Button } from 'ui/components/ui/buttons/Button';
import { Error } from 'ui/components/ui/error';
import { PAGES } from 'ui/pageConfig';
import { useAppDispatch, useAppSelector } from 'ui/store';
import * as styles from './importLedger.module.css';

const USERS_PER_PAGE = 5;

interface ArrowProps {
  direction: 'left' | 'right';
}

function Arrow({ direction }: ArrowProps) {
  return (
    <svg
      className={cn(styles.avatarListArrowSvg, {
        [styles.avatarListArrowSvg_left]: direction === 'left',
      })}
      width="14"
      height="14"
      style={{
        transform: direction === 'right' ? undefined : 'scaleX(-1)',
      }}
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
  const [error, setError] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [ledgerUsers, setLedgerUsers] = React.useState<LedgerUser[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<LedgerUser | null>(
    null
  );

  const networkCode =
    customCodes[currentNetwork] ||
    networks.find(n => currentNetwork === n.name).code;

  const connectToLedger = React.useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    await ledgerService.connectUsb(networkCode);

    if (ledgerService.status === LedgerServiceStatus.Ready) {
      const users = await ledgerService.ledger.getPaginationUsersData(
        0,
        USERS_PER_PAGE - 1
      );

      setLedgerUsers(users);
      setSelectedUser(users[0]);
      setIsReady(true);
      setIsConnecting(false);
    } else {
      switch (ledgerService.status) {
        case LedgerServiceStatus.UsedBySomeOtherApp:
          setError(t('ledgerErrors.usedBySomeOtherApp'));
          break;
        default:
          setError(t('ledgerErrors.unknown'));
          break;
      }

      setIsConnecting(false);
    }
  }, [networkCode]);

  React.useEffect(() => {
    connectToLedger();
  }, [connectToLedger]);

  React.useEffect(() => {
    return () => {
      ledgerService.disconnect();
    };
  }, []);

  const isCurPageLoaded = ledgerUsers.length >= (page + 1) * USERS_PER_PAGE;

  React.useEffect(() => {
    if (!isReady || isCurPageLoaded) {
      return;
    }

    ledgerService.ledger
      .getPaginationUsersData(page * USERS_PER_PAGE, USERS_PER_PAGE - 1)
      .then(users => {
        setLedgerUsers(prevState => prevState.concat(users));
      });
  }, [isCurPageLoaded, isReady, page]);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>
        <Trans i18nKey="importLedger.title" />
      </h2>

      {isReady ? (
        <div>
          <p className={styles.instructions}>
            <Trans i18nKey="importLedger.selectAccountInstructions" />
          </p>

          <div className={styles.avatarList}>
            <div className={styles.avatarListItems}>
              {isCurPageLoaded ? (
                <AvatarList
                  items={ledgerUsers.slice(
                    page * USERS_PER_PAGE,
                    (page + 1) * USERS_PER_PAGE
                  )}
                  selected={selectedUser}
                  size={38}
                  onSelect={user => {
                    setError(null);
                    setSelectedUser(user);
                  }}
                />
              ) : (
                <Trans i18nKey="importLedger.avatarListLoading" />
              )}
            </div>

            {page > 0 && (
              <button
                className={cn(
                  styles.avatarListArrow,
                  styles.avatarListArrow_left
                )}
                type="button"
                onClick={() => {
                  setPage(prevState => prevState - 1);
                }}
              >
                <Arrow direction="left" />
              </button>
            )}

            <button
              className={cn(
                styles.avatarListArrow,
                styles.avatarListArrow_right
              )}
              disabled={!isCurPageLoaded}
              type="button"
              onClick={() => {
                setPage(prevState => prevState + 1);
              }}
            >
              <Arrow direction="right" />
            </button>
          </div>

          <Error className={styles.error} show>
            {error}
          </Error>

          <div className={cn(styles.address, 'grey-line')}>
            {selectedUser.address}
          </div>

          <Button
            type="submit"
            onClick={() => {
              if (accounts.some(acc => acc.address === selectedUser.address)) {
                setError(t('importLedger.accountExistsError'));
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

              setTab(PAGES.ACCOUNT_NAME);
            }}
          >
            <Trans i18nKey="importLedger.continueButton" />
          </Button>
        </div>
      ) : (
        <div>
          <p className={styles.instructions}>
            <Trans i18nKey="importLedger.connectInstructions" />
          </p>

          <Error className={styles.error} show>
            {error}
          </Error>

          {isConnecting ? (
            <div className={styles.loader} />
          ) : (
            <Button
              disabled={isConnecting}
              type="submit"
              onClick={connectToLedger}
            >
              <Trans i18nKey="importLedger.tryAgainButton" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
