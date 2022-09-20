import { Asset, Money } from '@waves/data-entities';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { getAsset } from '../../actions/assets';
import Background from '../../services/Background';
import { getAccountLink } from '../../urls';
import { Avatar, Balance, Button, CopyText, Error, Input, Modal } from '../ui';
import * as styles from './styles/accountInfo.styl';

export function AccountInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const notifications = useAppSelector(state => state.localState.notifications);

  const selectedAccount = useAppSelector(state => {
    const selected = state.localState.assets.account
      ? state.localState.assets.account.address
      : state.selectedAccount.address;

    return state.accounts.find(x => x.address === selected);
  });

  const copiedTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

  const defferRef = React.useRef<{
    reject: () => void;
    resolve: (password: string) => void;
  }>();

  const [password, setPassword] = React.useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = React.useState(false);
  const [showCopied, setShowCopied] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const asset = assets['WAVES'];

  let balance: Money | null = null;
  let leaseBalance: Money | undefined;

  if (asset && selectedAccount) {
    const assetInstance = new Asset(asset);
    const balancesMoney: Record<string, Money> = {};
    const leaseMoney: Record<string, Money> = {};

    Object.entries(balances).forEach(([key, balance]) => {
      if (!balance) {
        return;
      }

      balancesMoney[key] = new Money(balance.available, assetInstance);
      leaseMoney[key] = new Money(balance.leasedOut, assetInstance);
    });

    balance = balancesMoney[selectedAccount.address];
    leaseBalance = leaseMoney[selectedAccount.address];
  } else {
    dispatch(getAsset('WAVES'));
  }

  if (!selectedAccount) {
    return null;
  }

  const rejectPassword = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defferRef.current!.reject();
  };

  const onCopyHandler = () => {
    if (copiedTimerRef.current != null) {
      clearTimeout(copiedTimerRef.current);
    }

    setShowCopied(true);

    copiedTimerRef.current = setTimeout(() => {
      setShowCopied(false);
    }, 1000);
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

  const getSeed = (copyCallback: (text: string) => void) => {
    requestPrivateData({
      copyCallback,
      request: password =>
        Background.getAccountSeed(
          selectedAccount.address,
          currentNetwork,
          password
        ),
      retry: () => getSeed(copyCallback),
    });
  };

  const getEncodedSeed = (copyCallback: (text: string) => void) => {
    requestPrivateData({
      copyCallback,
      request: password =>
        Background.getAccountEncodedSeed(
          selectedAccount.address,
          currentNetwork,
          password
        ).then(encodedSeed => `base58:${encodedSeed}`),
      retry: () => getEncodedSeed(copyCallback),
    });
  };

  const getPrivateKey = (copyCallback: (text: string) => void) => {
    requestPrivateData({
      copyCallback,
      request: password =>
        Background.getAccountPrivateKey(
          selectedAccount.address,
          currentNetwork,
          password
        ),
      retry: () => getPrivateKey(copyCallback),
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={`flex ${styles.wallet}`}>
          <Avatar
            className={styles.avatar}
            address={selectedAccount.address}
            type={selectedAccount.type}
            size={48}
          />
          <div className={styles.accountData}>
            <div>
              <Button
                type="button"
                view="transparent"
                className={styles.accountName}
                onClick={() => {
                  navigate('/change-account-name');
                }}
              >
                <span className={`basic500 body1`}>{selectedAccount.name}</span>
                <i className={styles.editIcon}> </i>
              </Button>
            </div>
            <div className={`headline1 marginTop1 ${styles.balance}`}>
              <Balance
                split={true}
                showAsset={true}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                balance={balance!}
                showUsdAmount
              />

              {leaseBalance && leaseBalance.gt(leaseBalance.cloneWithCoins(0)) && (
                <div
                  className={`${styles.reservedBalance} margin-main-big-top`}
                >
                  <span>{leaseBalance.toFormat()}</span>
                  <span className="basic500 font300">{t('wallet.lease')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="margin-main-top center">
          <a
            className="link black"
            href={getAccountLink(
              selectedAccount.networkCode,
              selectedAccount.address
            )}
            target="_blank"
            rel="noopener noreferrer"
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
            text={selectedAccount.address}
            showCopy={true}
            showText={true}
            onCopy={onCopyHandler}
          />
        </div>
      </div>

      {selectedAccount.type !== 'debug' && (
        <div id="accountInfoPublicKey" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.pubKey')}
          </div>
          <div className={`input-like tag1 ${styles.ellipsis}`}>
            <CopyText
              text={selectedAccount.publicKey}
              showCopy={true}
              showText={true}
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      )}

      {['seed', 'encodedSeed', 'privateKey'].includes(selectedAccount.type) && (
        <div id="accountInfoPrivateKey" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.privKey')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              type="key"
              getText={getPrivateKey}
              showCopy={true}
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      )}

      {selectedAccount.type === 'seed' ? (
        <div id="accountInfoBackupPhrase" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.backUp')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              type="key"
              getText={getSeed}
              showCopy={true}
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      ) : selectedAccount.type === 'privateKey' ? (
        <div className="margin-main-big basic500">
          <div className="input-title tag1">{t('accountInfo.backUp')}</div>

          <div>{t('accountInfo.privateKeyNoBackupPhrase')}</div>
        </div>
      ) : selectedAccount.type === 'encodedSeed' ? (
        <div id="accountInfoBackupPhrase" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.encodedSeed')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              type="key"
              getText={getEncodedSeed}
              showCopy={true}
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      ) : selectedAccount.type === 'wx' ? (
        <>
          <div className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.email')}
            </div>
            <div className={`input-like tag1 ${styles.ellipsis}`}>
              <CopyText
                text={selectedAccount.username}
                showCopy={true}
                showText={true}
                onCopy={onCopyHandler}
              />
            </div>
          </div>

          <div className="margin-main-big basic500">
            <div className="input-title tag1">{t('accountInfo.backUp')}</div>

            <div>{t('accountInfo.emailNoBackupPhrase')}</div>
          </div>
        </>
      ) : selectedAccount.type === 'debug' ? (
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
            navigate('/delete-active-account');
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
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              defferRef.current!.resolve(password!);
            }}
          >
            <i className={`lock-icon ${styles.lockIcon}`} />

            <div className="margin1 relative">
              <div className="basic500 tag1 input-title">
                {t('accountInfo.password')}
              </div>
              <Input
                autoFocus
                type="password"
                view="password"
                error={passwordError}
                wrapperClassName="margin1"
                onChange={event => {
                  setPassword(event.currentTarget.value);
                  setPasswordError(false);
                }}
              />

              <Error show={passwordError}>
                <div className="error">{t('accountInfo.passwordError')}</div>
              </Error>
            </div>

            <Button
              id="passwordEnter"
              disabled={passwordError || !password}
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
        showModal={notifications.changeName}
      >
        <div className="modal notification active-asset" key="change_name">
          <div>{t('assets.changeName')}</div>
        </div>
      </Modal>
    </div>
  );
}
