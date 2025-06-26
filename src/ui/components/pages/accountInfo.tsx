import { Asset, Money } from '@waves/data-entities';
import { type Network, type NetworkName } from 'networks/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import type { PreferencesAccount } from 'preferences/types';
import { isMultichainAccount } from 'preferences/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { notificationChangeName } from 'store/actions/localState';

import Background from '../../services/Background';
import { getAccountLink } from '../../urls';
import {
  Avatar,
  Balance,
  Button,
  CopyText,
  ErrorMessage,
  Input,
  Modal,
} from '../ui';
import * as styles from './styles/accountInfo.styl';

export function AccountInfo() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ address: string }>();
  const location = useLocation();

  const dispatch = usePopupDispatch();
  const assets = usePopupSelector(state => state.assets);
  const balances = usePopupSelector(state => state.balances);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);

  const showChangeNameNotification = usePopupSelector(
    state => state.localState.notifications.changeName,
  );

  const wavesAccount = usePopupSelector(state =>
    state.accounts.find(
      x => x.accountType === 'waves' && x.address === params.address,
    ),
  );
  const multichainAccount = usePopupSelector(state => {
    const id = params.address;
    return state.allNetworksAccounts.find(
      x => x.id === id && x.accountType === 'multichain',
    );
  });
  const account = multichainAccount || wavesAccount;

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const defferRef = useRef<{
    reject: () => void;
    resolve: (password: string) => void;
  }>();

  const [thePassword, setThePassword] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const wavesAsset = assets.WAVES;

  const onCopyHandler = () => {
    if (copiedTimerRef.current != null) {
      clearTimeout(copiedTimerRef.current);
    }
    setShowCopied(true);
    copiedTimerRef.current = setTimeout(() => {
      setShowCopied(false);
    }, 1000);
  };

  const rejectPassword = () => {
    defferRef.current && defferRef.current.reject();
  };

  const requestPrivateData = ({
    copyCallback,
    request,
    retry,
  }: {
    copyCallback: (text: string) => void;
    request: (password: string) => Promise<string>;
    retry: () => void;
  }) => {
    setShowPassword(true);

    new Promise<string>((resolve, reject) => {
      defferRef.current = { resolve, reject };
    })
      .then(password => request(password))
      .then(data => {
        setShowPassword(false);
        setPasswordError(false);
        copyCallback(data);
      })
      .catch(err => {
        if (err) {
          setPasswordError(true);
          retry();
          return;
        }

        setShowPassword(false);
        setPasswordError(false);
      });
  };

  let balance: Money | undefined;
  let leaseBalance: Money | undefined;

  if (account) {
    if (isMultichainAccount(account)) {
      const ethereumAccount = account.accounts.ethereum;
      const address = ethereumAccount?.address;
      if (address) {
        const balanceItem = balances[address];
        const unit0Asset = assets.unit0;
        if (balanceItem && unit0Asset && balanceItem.assets?.unit0) {
          balance = new Money(
            balanceItem.assets.unit0.balance,
            new Asset(unit0Asset),
          );
        }
      }
    } else if (assets.WAVES) {
      const address = account.address;
      const balanceItem = balances[address];
      if (balanceItem) {
        const assetInstance = new Asset(assets.WAVES);
        if (typeof balanceItem.available !== 'undefined') {
          balance = new Money(balanceItem.available, assetInstance);
        }
        if (typeof balanceItem.leasedOut !== 'undefined') {
          leaseBalance = new Money(balanceItem.leasedOut, assetInstance);
        }
      }
    }
  }

  useEffect(() => {
    if (!showChangeNameNotification) return;
    setTimeout(() => dispatch(notificationChangeName(false)), 1000);
  }, [dispatch, showChangeNameNotification]);

  if (!account) {
    return null;
  }

  const getPrivateKey =
    (address: string, network: NetworkName, chain: string) =>
    (copyCallback: (text: string) => void) => {
      requestPrivateData({
        copyCallback,
        request: password =>
          Background.getAccountPrivateKey(
            address,
            network,
            password,
            chain as Network,
          ),
        retry: () => getPrivateKey(address, network, chain)(copyCallback),
      });
    };

  const getSeed =
    (address: string, network: NetworkName, chain: string) =>
    (copyCallback: (text: string) => void) => {
      requestPrivateData({
        copyCallback,
        request: password =>
          Background.getAccountSeed(address, network, password),
        retry: () => getSeed(address, network, chain)(copyCallback),
      });
    };

  const getEthereumPrivateKey =
    (address: string, network: NetworkName, chain: string) =>
    (copyCallback: (text: string) => void) => {
      requestPrivateData({
        copyCallback,
        request: async password => {
          const seed = await Background.getAccountSeed(
            address,
            network,
            password,
            chain as Network,
          );
          const ethers = await import('ethers');
          return ethers.Wallet.fromPhrase(seed).privateKey;
        },
        retry: () =>
          getEthereumPrivateKey(address, network, chain)(copyCallback),
      });
    };

  const wxAccount = isWxAccount(account)
    ? (account as { username?: string })
    : undefined;

  if (isMultichainAccount(account)) {
    const eth = account.accounts.ethereum;
    const waves = account.accounts.waves;
    if (!waves) return null;

    return (
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={`flex ${styles.wallet}`}>
            <Avatar
              className={styles.avatar}
              address={waves.address}
              size={48}
            />
            <div className={styles.accountData}>
              <div>
                <Button
                  type="button"
                  view="transparent"
                  className={styles.accountName}
                  onClick={() => {
                    navigate(`/change-account-name/${account.id}`);
                  }}
                >
                  <span className="basic500 body1">{account.name}</span>
                  <i className={styles.editIcon}> </i>
                </Button>
              </div>
              {balance && (
                <div className={styles.balance}>
                  <Balance balance={balance} showAsset split />
                </div>
              )}
            </div>
          </div>
        </div>

        {waves && (
          <div>
            <div>Waves</div>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">Address</div>
              <div className="input-like tag1">
                <CopyText
                  showCopy
                  showText
                  text={waves.address || ''}
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">Public key</div>
              <div className={`input-like tag1 ${styles.ellipsis}`}>
                <CopyText
                  showCopy
                  showText
                  text={waves.publicKey || ''}
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">Private key</div>
              <div className="input-like password-input tag1">
                <CopyText
                  getText={getPrivateKey(account.id, currentNetwork, 'waves')}
                  showCopy
                  type="key"
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
          </div>
        )}

        {eth && (
          <div>
            <div>Ethereum</div>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">Address</div>
              <div className="input-like tag1">
                <CopyText
                  showCopy
                  showText
                  text={eth.address || ''}
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">Public key</div>
              <div className={`input-like tag1 ${styles.ellipsis}`}>
                <CopyText
                  showCopy
                  showText
                  text={eth.publicKey || ''}
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">Private key</div>
              <div className="input-like password-input tag1">
                <CopyText
                  getText={getEthereumPrivateKey(
                    account.id,
                    currentNetwork,
                    'ethereum',
                  )}
                  showCopy
                  type="key"
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
          </div>
        )}

        <div className="margin-main-big">
          <div className="input-title basic500 tag1">Backup phrase</div>
          <div className="input-like password-input tag1">
            <CopyText
              getText={getSeed(account.id, currentNetwork, 'waves')}
              showCopy
              type="key"
              onCopy={onCopyHandler}
            />
          </div>
        </div>
        <div className={styles.accountInfoFooter}>
          <div
            className={styles.deleteButton}
            onClick={() => {
              navigate(`/delete-account/${account.id}?type=multichain`);
            }}
          >
            <div className={`${styles.deleteIcon} delete-icon`} />
            <div>Delete account</div>
          </div>
        </div>

        <Modal animation={Modal.ANIMATION.FLASH} showModal={showPassword}>
          <div className="modal cover">
            <form
              id="enterPassword"
              className="modal-form"
              onSubmit={event => {
                event.preventDefault();
                defferRef.current &&
                  thePassword &&
                  defferRef.current.resolve(thePassword);
              }}
            >
              <i className={`lock-icon ${styles.lockIcon}`} />

              <div className="margin1 relative">
                <div className="basic500 tag1 input-title">
                  {t('accountInfo.password')}
                </div>

                <Input
                  autoComplete="current-password"
                  autoFocus
                  type="password"
                  view="password"
                  error={passwordError}
                  wrapperClassName="margin1"
                  onChange={event => {
                    setThePassword(event.currentTarget.value);
                    setPasswordError(false);
                  }}
                />

                <ErrorMessage show={passwordError}>
                  <div className="error">{t('accountInfo.passwordError')}</div>
                </ErrorMessage>
              </div>

              <Button
                id="passwordEnter"
                disabled={passwordError || !thePassword}
                className="margin-main-big"
                type="submit"
                view="submit"
              >
                {t('accountInfo.enter')}
              </Button>

              <Button
                id="passwordCancel"
                type="button"
                onClick={rejectPassword}
              >
                {t('accountInfo.cancel')}
              </Button>

              <Button
                className="modal-close"
                type="button"
                view="transparent"
                onClick={rejectPassword}
              />
            </form>
          </div>
        </Modal>

        <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopied}>
          <div className="modal notification">{t('accountInfo.copied')}</div>
        </Modal>
      </div>
    );
  }

  function isWxAccount(
    theAccount: PreferencesAccount,
  ): theAccount is Extract<PreferencesAccount, { type: 'wx' }> {
    return theAccount.accountType === 'waves' && theAccount.type === 'wx';
  }

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={`flex ${styles.wallet}`}>
          <Avatar
            className={styles.avatar}
            address={account.address}
            type={account.accountType === 'waves' ? account.type : undefined}
            size={48}
          />

          <div className={styles.accountData}>
            <div>
              <Button
                type="button"
                view="transparent"
                className={styles.accountName}
                onClick={() => {
                  navigate(`/change-account-name/${params.address}`);
                }}
              >
                <span className="basic500 body1">{account.name}</span>
                <i className={styles.editIcon}> </i>
              </Button>
            </div>

            <div className={`headline1 marginTop1 ${styles.balance}`}>
              <Balance balance={balance} showAsset split showUsdAmount />

              {leaseBalance &&
                leaseBalance.gt(leaseBalance.cloneWithCoins(0)) && (
                  <div
                    className={`${styles.reservedBalance} margin-main-big-top`}
                  >
                    <span>{leaseBalance.toFormat()}</span>
                    <span className="basic500 font300">
                      {t('wallet.lease')}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="margin-main-top center">
          <a
            className="link black"
            href={
              account.accountType === 'waves'
                ? getAccountLink(account.networkCode, account.address)
                : undefined
            }
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('accountInfo.viewInExplorer')}
          </a>
        </div>
      </div>

      <div id="accountInfoAddress" className="margin-main-big">
        <div className="input-title basic500 tag1">
          {t('accountInfo.address')}
        </div>
        <div className="input-like tag1">
          <CopyText
            showCopy
            showText
            text={account.address}
            onCopy={onCopyHandler}
          />
        </div>
      </div>

      {account.accountType === 'waves' && account.type !== 'debug' && (
        <div id="accountInfoPublicKey" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.pubKey')}
          </div>
          <div className={`input-like tag1 ${styles.ellipsis}`}>
            <CopyText
              showCopy
              showText
              text={account.publicKey}
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      )}

      {account.accountType === 'waves' &&
        ['seed', 'encodedSeed', 'privateKey'].includes(account.type) && (
          <div id="accountInfoPrivateKey" className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.privKey')}
            </div>
            <div className="input-like password-input tag1">
              <CopyText
                getText={getPrivateKey(
                  account.address,
                  currentNetwork,
                  'waves',
                )}
                showCopy
                type="key"
                onCopy={onCopyHandler}
              />
            </div>
          </div>
        )}

      {account.accountType === 'waves' && account.type === 'seed' ? (
        <div id="accountInfoBackupPhrase" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.backUp')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              getText={getSeed(account.address, currentNetwork, 'waves')}
              showCopy
              type="key"
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      ) : account.accountType === 'waves' && account.type === 'privateKey' ? (
        <div className="margin-main-big basic500">
          <div className="input-title tag1">{t('accountInfo.backUp')}</div>

          <div>{t('accountInfo.privateKeyNoBackupPhrase')}</div>
        </div>
      ) : account.accountType === 'waves' && account.type === 'encodedSeed' ? (
        <div id="accountInfoBackupPhrase" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.encodedSeed')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              getText={getSeed(account.address, currentNetwork, 'waves')}
              showCopy
              type="key"
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      ) : account.accountType === 'waves' && account.type === 'wx' ? (
        <>
          <div className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.email')}
            </div>
            <div className={`input-like tag1 ${styles.ellipsis}`}>
              <CopyText
                showCopy
                showText
                text={wxAccount?.username || ''}
                onCopy={onCopyHandler}
              />
            </div>
          </div>

          <div className="margin-main-big basic500">
            <div className="input-title tag1">{t('accountInfo.backUp')}</div>

            <div>{t('accountInfo.emailNoBackupPhrase')}</div>
          </div>
        </>
      ) : account.accountType === 'waves' && account.type === 'debug' ? (
        <>
          <div className="margin-main-big basic500">
            <div className="input-title tag1">{t('accountInfo.backUp')}</div>

            <div>{t('accountInfo.debugNoBackupPhrase')}</div>
          </div>
        </>
      ) : null}

      <div className={styles.accountInfoFooter}>
        <div
          className={styles.deleteButton}
          onClick={() => {
            navigate(`/delete-account/${params.address}`);
          }}
        >
          <div className={`${styles.deleteIcon} delete-icon`} />
          <div>{t('deleteAccount.delete')}</div>
        </div>
      </div>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showPassword}>
        <div className="modal cover">
          <form
            id="enterPassword"
            className="modal-form"
            onSubmit={event => {
              event.preventDefault();
              defferRef.current &&
                thePassword &&
                defferRef.current.resolve(thePassword);
            }}
          >
            <i className={`lock-icon ${styles.lockIcon}`} />

            <div className="margin1 relative">
              <div className="basic500 tag1 input-title">
                {t('accountInfo.password')}
              </div>

              <Input
                autoComplete="current-password"
                autoFocus
                type="password"
                view="password"
                error={passwordError}
                wrapperClassName="margin1"
                onChange={event => {
                  setThePassword(event.currentTarget.value);
                  setPasswordError(false);
                }}
              />

              <ErrorMessage show={passwordError}>
                <div className="error">{t('accountInfo.passwordError')}</div>
              </ErrorMessage>
            </div>

            <Button
              id="passwordEnter"
              disabled={passwordError || !thePassword}
              className="margin-main-big"
              type="submit"
              view="submit"
            >
              {t('accountInfo.enter')}
            </Button>

            <Button id="passwordCancel" type="button" onClick={rejectPassword}>
              {t('accountInfo.cancel')}
            </Button>

            <Button
              className="modal-close"
              type="button"
              view="transparent"
              onClick={rejectPassword}
            />
          </form>
        </div>
      </Modal>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopied}>
        <div className="modal notification">{t('accountInfo.copied')}</div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showChangeNameNotification}
      >
        <div className="modal notification active-asset" key="change_name">
          <div>{t('assets.changeName')}</div>
        </div>
      </Modal>
    </div>
  );
}
