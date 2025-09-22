import { Asset, Money } from '@waves/data-entities';
import { type IAssetInfo } from '@waves/data-entities/dist/entities/Asset';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationChangeName } from 'store/actions/localState';

import { BLOCKCHAIN_TYPES } from '../../../assets/constants';
import { type MultiWallet } from '../../../services/types';
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

  const dispatch = usePopupDispatch();
  const assets = usePopupSelector(state => state.assets);
  const balances = usePopupSelector(state => state.balances);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType,
  );
  const showChangeNameNotification = usePopupSelector(
    state => state.localState.notifications.changeName,
  );

  useEffect(() => {
    if (!showChangeNameNotification) return;

    setTimeout(() => dispatch(notificationChangeName(false)), 1000);
  }, [dispatch, showChangeNameNotification]);

  const account = usePopupSelector(state =>
    state.accounts.find(x => x.address === params.address),
  );

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const defferRef = useRef<{
    reject: () => void;
    resolve: (password: string) => void;
  }>();

  const [password, setPassword] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const wavesAsset = assets.WAVES;
  const unit0Asset = assets.unit0; // Unit0 native token

  let balance: Money | undefined;
  let leaseBalance: Money | undefined;

  if (account) {
    const isMultiChainWallet = account.type === 'multichain';
    const balanceItem = balances[account.address];

    if (balanceItem) {
      // For multichain accounts, check if base account should be Unit0
      if (
        isMultiChainWallet &&
        currentBlockchainType === BLOCKCHAIN_TYPES.UNIT0 &&
        unit0Asset
      ) {
        // Use Unit0 balance
        const assetInstance = new Asset(unit0Asset as IAssetInfo);

        if (typeof balanceItem.available !== 'undefined')
          balance = new Money(balanceItem.available, assetInstance);

        // Unit0 doesn't have lease functionality, so no leaseBalance
      } else if (wavesAsset) {
        // Use Waves balance (default for non-multichain or when on Waves blockchain)
        const assetInstance = new Asset(wavesAsset as IAssetInfo);

        if (typeof balanceItem.available !== 'undefined')
          balance = new Money(balanceItem.available, assetInstance);

        if (typeof balanceItem.leasedOut !== 'undefined')
          leaseBalance = new Money(balanceItem.leasedOut, assetInstance);
      }
    }
  }

  if (!account) {
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
      // eslint-disable-next-line @typescript-eslint/no-shadow
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
      // eslint-disable-next-line @typescript-eslint/no-shadow
      request: password =>
        Background.getAccountSeed(
          account.address,
          currentBlockchainType,
          password,
        ),
      retry: () => getSeed(copyCallback),
    });
  };

  const getEncodedSeed = (copyCallback: (text: string) => void) => {
    requestPrivateData({
      copyCallback,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      request: password =>
        Background.getAccountEncodedSeed(
          account.address,
          currentNetwork,
          password,
        ).then(encodedSeed => `base58:${encodedSeed}`),
      retry: () => getEncodedSeed(copyCallback),
    });
  };

  const getPrivateKey = (copyCallback: (text: string) => void) => {
    requestPrivateData({
      copyCallback,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      request: password =>
        Background.getAccountPrivateKey(
          account.address,
          currentBlockchainType,
          password,
        ) as Promise<string>,
      retry: () => getPrivateKey(copyCallback),
    });
  };

  const getUnit0PrivateKey = (copyCallback: (text: string) => void) => {
    // Get Unit0 address for the current network
    const unit0NetworkKey = networkKey === 'stagenet' ? 'testnet' : networkKey;
    const unit0Address = (account as unknown as MultiWallet).coins?.unit0
      ?.networks?.[unit0NetworkKey]?.address;

    if (!unit0Address) {
      console.error('Unit0 address not found for this network');
      return;
    }

    requestPrivateData({
      copyCallback,
      request: async passwordForSeed => {
        try {
          // Use the Unit0 address for seed lookup
          const seed = await Background.getAccountSeed(
            unit0Address, // Use Unit0 address instead of Waves address
            'unit0',
            passwordForSeed,
          );

          if (!seed) {
            return 'Error: Unable to retrieve private key';
          }

          const ethers = await import('ethers');
          return ethers.Wallet.fromPhrase(seed).privateKey;
        } catch (error) {
          return 'Error retrieving private key';
        }
      },
      retry: () => getUnit0PrivateKey(copyCallback),
    });
  };

  const isMultiChainWallet = account.type === 'multichain';

  const getNetworkKeyForCurrentNetwork = () => {
    switch (currentNetwork) {
      case 'mainnet':
        return 'mainnet';
      case 'testnet':
        return 'testnet';
      case 'stagenet':
        return 'stagenet';
      default:
        return 'mainnet'; // Default to mainnet if unknown
    }
  };

  const networkKey = getNetworkKeyForCurrentNetwork();

  const multiAccount = account as unknown as MultiWallet;
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={`flex ${styles.wallet}`}>
          <Avatar
            className={styles.avatar}
            address={account.address}
            type={account.type}
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
            href={getAccountLink(account.networkCode, account.address)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('accountInfo.viewInExplorer')}
          </a>
        </div>
      </div>

      {!isMultiChainWallet && (
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
      )}

      {isMultiChainWallet && multiAccount.coins && (
        <>
          {/* Public info section */}
          <div className="margin-main-big">
            <h2>{t('accountInfo.publicInfo')}</h2>

            <div className="input-title basic500 tag1">
              {t('accountInfo.wavesAddress')}
            </div>
            {multiAccount.coins.waves &&
              multiAccount.coins.waves.networks &&
              multiAccount.coins.waves.networks[networkKey] && (
                <div className="margin-main-big">
                  <div className="input-like tag1">
                    <CopyText
                      showCopy
                      showText
                      text={
                        multiAccount.coins.waves.networks[networkKey]?.address
                      }
                      onCopy={onCopyHandler}
                    />
                  </div>
                </div>
              )}

            <div className="input-title basic500 tag1">
              {t('accountInfo.unit0Address')}
            </div>
            {multiAccount.coins.unit0 &&
              multiAccount.coins.unit0.networks &&
              multiAccount.coins.unit0.networks[
                networkKey === 'stagenet' ? 'testnet' : networkKey
              ] && (
                <div className="margin-main-big">
                  <div className="input-like tag1">
                    <CopyText
                      showCopy
                      showText
                      text={
                        multiAccount.coins.unit0.networks[
                          networkKey === 'stagenet' ? 'testnet' : networkKey
                        ].address
                      }
                      onCopy={onCopyHandler}
                    />
                  </div>
                </div>
              )}

            <div className="input-title basic500 tag1">
              {t('accountInfo.wavesPublicKey')}
            </div>
            {multiAccount.coins.waves && (
              <div className="margin-main-big">
                <div className={`input-like tag1 ${styles.ellipsis}`}>
                  <CopyText
                    showCopy
                    showText
                    text={multiAccount.coins.waves.publicKey}
                    onCopy={onCopyHandler}
                  />
                </div>
              </div>
            )}

            <div className="input-title basic500 tag1">
              {t('accountInfo.unit0PublicKey')}
            </div>
            {multiAccount.coins.unit0 && (
              <div className="margin-main-big">
                <div className={`input-like tag1 ${styles.ellipsis}`}>
                  <CopyText
                    showCopy
                    showText
                    text={multiAccount.coins.unit0.publicKey}
                    onCopy={onCopyHandler}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Private info section */}
          <div className="margin-main-big">
            <h2>{t('accountInfo.privateInfo')}</h2>

            <div className="input-title basic500 tag1">
              {t('accountInfo.wavesPrivateKey')}
            </div>
            {multiAccount.coins.waves &&
              multiAccount.coins.waves.networks &&
              multiAccount.coins.waves.networks[networkKey] && (
                <div className="margin-main-big">
                  <div className="input-like password-input tag1">
                    <CopyText
                      getText={getPrivateKey}
                      showCopy
                      type="key"
                      onCopy={onCopyHandler}
                    />
                  </div>
                </div>
              )}

            <div className="input-title basic500 tag1">
              {t('accountInfo.unit0PrivateKey')}
            </div>
            {multiAccount.coins.unit0 &&
              multiAccount.coins.unit0.networks &&
              multiAccount.coins.unit0.networks[
                networkKey === 'stagenet' ? 'testnet' : networkKey
              ] && (
                <div className="margin-main-big">
                  <div className="input-like password-input tag1">
                    <CopyText
                      getText={getUnit0PrivateKey}
                      showCopy
                      type="key"
                      onCopy={onCopyHandler}
                    />
                  </div>
                </div>
              )}

            <div className="input-title basic500 tag1">
              {t('accountInfo.backUp')}
            </div>
            <div className="margin-main-big">
              <div className="input-like password-input tag1">
                <CopyText
                  getText={getSeed}
                  showCopy
                  type="key"
                  onCopy={onCopyHandler}
                />
              </div>
            </div>
          </div>
        </>
      )}
      {account.type !== 'debug' && multiAccount.type !== 'multichain' && (
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
      {['seed', 'encodedSeed', 'privateKey'].includes(account.type) && (
        <div id="accountInfoPrivateKey" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.privKey')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              getText={getPrivateKey}
              showCopy
              type="key"
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      )}

      {account.type === 'seed' ? (
        <div id="accountInfoBackupPhrase" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.backUp')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              getText={getSeed}
              showCopy
              type="key"
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      ) : account.type === 'privateKey' ? (
        <div className="margin-main-big basic500">
          <div className="input-title tag1">{t('accountInfo.backUp')}</div>

          <div>{t('accountInfo.privateKeyNoBackupPhrase')}</div>
        </div>
      ) : account.type === 'encodedSeed' ? (
        <div id="accountInfoBackupPhrase" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.encodedSeed')}
          </div>
          <div className="input-like password-input tag1">
            <CopyText
              getText={getEncodedSeed}
              showCopy
              type="key"
              onCopy={onCopyHandler}
            />
          </div>
        </div>
      ) : account.type === 'wx' ? (
        <>
          <div className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.email')}
            </div>
            <div className={`input-like tag1 ${styles.ellipsis}`}>
              <CopyText
                showCopy
                showText
                text={account.username}
                onCopy={onCopyHandler}
              />
            </div>
          </div>

          <div className="margin-main-big basic500">
            <div className="input-title tag1">{t('accountInfo.backUp')}</div>

            <div>{t('accountInfo.emailNoBackupPhrase')}</div>
          </div>
        </>
      ) : account.type === 'debug' ? (
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
                autoComplete="current-password"
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

              <ErrorMessage show={passwordError}>
                <div className="error">{t('accountInfo.passwordError')}</div>
              </ErrorMessage>
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
        showModal={showChangeNameNotification}
      >
        <div className="modal notification active-asset" key="change_name">
          <div>{t('assets.changeName')}</div>
        </div>
      </Modal>
    </div>
  );
}
