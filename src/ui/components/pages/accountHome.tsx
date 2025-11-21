import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import background from 'ui/services/Background';
import { usePopupSelector } from '../../../popup/store/react';
import keeperWalletLock from '../../assets/img/keeper-wallet-lock.svg';
import { Button } from '../ui';
import * as styles from './styles/import.styl';

export function ImportPopup() {
  const { t } = useTranslation();
  const currentNetwork = usePopupSelector(state => state.currentNetwork);

  return (
    <div data-testid="importForm" className={styles.root}>
      <img
        className={styles.importIcon}
        src={keeperWalletLock}
        alt=""
        width={216}
        height={137}
      />

      <p className="body1 disabled500 font300 center margin-main-big-top margin-main-large">
        <Trans
          i18nKey="import.noAccounts"
          values={{ currentNetwork: t(`bottom.${currentNetwork}`) }}
          t={t}
        />
      </p>
      <Button
        data-testid="addAccountBtn"
        view="submit"
        onClick={() =>
          background.showTab(
            `${window.location.origin}/accounts.html`,
            'accounts',
          )
        }
      >
        {t('import.addAccount')}
      </Button>
    </div>
  );
}

export function AccountsHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const customCodes = usePopupSelector(state => state.customCodes);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);

  const [isLedgerSupported, setIsLedgerSupported] = useState(false);
  const [isDebug, setDebug] = useState(false);

  useEffect(() => {
    TransportWebUSB.isSupported().then(setIsLedgerSupported);

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('debug')) {
      setDebug(true);
    }
  }, []);

  return (
    <div data-testid="importForm" className={styles.root}>
      <img
        className={styles.importIcon}
        src={keeperWalletLock}
        alt=""
        width={216}
        height={137}
      />

      <Button
        data-testid="createNewAccountBtn"
        view="submit"
        onClick={() => {
          navigate('/account-onboarding');
        }}
      >
        {t('import.createNew')}
      </Button>

      <div
        className={clsx('body1', 'disabled500', 'font300', styles.separator)}
      >
        {t('import.importVia')}
      </div>

      <div>
        {isDebug && (
          <div className={styles.importButtonsItem}>
            <Button
              className={styles.importButton}
              data-testid="importDebug"
              view="transparent"
              onClick={() => {
                navigate('/import-debug');
              }}
            >
              <svg
                className={styles.importButtonIcon}
                width="25"
                height="25"
                viewBox="0 0 48 48"
                fill="#0055FF"
              >
                <path d="M24 42Q20.85 42 18.275 40.225Q15.7 38.45 14.1 35.65L9.1 38.5L7.6 35.95L12.85 32.9Q12.6 32.05 12.4 31.2Q12.2 30.35 12.1 29.5H6V26.5H12.1Q12.2 25.65 12.4 24.8Q12.6 23.95 12.85 23.1L7.6 20L9.1 17.45L14.05 20.35Q14.5 19.55 15.05 18.875Q15.6 18.2 16.2 17.55Q16.1 17.15 16.05 16.775Q16 16.4 16 16Q16 14.6 16.525 13.275Q17.05 11.95 18 10.9L14.7 7.65L16.8 5.5L20.35 9Q21.2 8.5 22.1 8.25Q23 8 24 8Q25 8 25.9 8.25Q26.8 8.5 27.65 9L31.2 5.5L33.3 7.65L30 10.95Q30.9 12 31.425 13.3Q31.95 14.6 31.95 16Q31.95 16.4 31.925 16.75Q31.9 17.1 31.8 17.5Q32.4 18.15 32.925 18.825Q33.45 19.5 33.9 20.3L38.9 17.5L40.4 20.05L35.15 23.05Q35.45 23.9 35.625 24.75Q35.8 25.6 35.9 26.5H42V29.5H35.9Q35.8 30.35 35.625 31.225Q35.45 32.1 35.15 32.95L40.4 36L38.9 38.55L33.9 35.65Q32.3 38.45 29.725 40.225Q27.15 42 24 42ZM19.05 15.3Q20.2 14.65 21.45 14.325Q22.7 14 24 14Q25.3 14 26.525 14.325Q27.75 14.65 28.9 15.25Q28.6 13.6 27.15 12.3Q25.7 11 24 11Q22.3 11 20.825 12.3Q19.35 13.6 19.05 15.3ZM24 39Q27.85 39 30.425 35.55Q33 32.1 33 28Q33 24.25 30.575 20.625Q28.15 17 24 17Q19.85 17 17.425 20.625Q15 24.25 15 28Q15 32.1 17.575 35.55Q20.15 39 24 39ZM22.5 34V22H25.5V34Z" />
              </svg>
              {t('import.viaDebug')}
            </Button>
          </div>
        )}

        <div className={styles.importButtonsItem}>
          <Button
            className={styles.importButton}
            data-testid="importSeed"
            view="transparent"
            onClick={() => {
              navigate('/import-choose');
            }}
          >
            <svg
              className={styles.importButtonIcon}
              width="25"
              height="25"
              viewBox="0 0 25 25"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.236 18.1194C11.4844 21.9837 16.1647 23.266 19.1788 20.5696C22.0276 18.0209 21.3906 13.4314 17.9485 11.7051L17.2869 11.3732V9.41114V7.44909H19.1435H21V5.6116V3.77412H19.1435H17.2869V2.88706V2H15.4944H13.7019V6.68659V11.3732L13.0403 11.7051C10.6788 12.8894 9.45253 15.6943 10.236 18.1194ZM13.9528 15.5972C14.6301 14.4977 16.4979 14.5435 17.0886 15.6742C17.7343 16.9098 16.8609 18.3473 15.4645 18.3473C14.0965 18.3473 13.2298 16.7706 13.9528 15.5972Z"
                fill="#1F5AF6"
              />
              <path
                d="M5.69379 11L3.81931 9.49356C4.41517 8.79828 5.03586 8.13305 5.68138 7.49785C5.93793 7.24034 6.09931 7.07725 6.16552 7.00858C5.95862 6.97425 5.3669 6.83262 4.39034 6.58369C3.6869 6.40343 3.22345 6.27039 3 6.18455L3.73241 3.91846C4.81655 4.37339 5.78483 4.87554 6.63724 5.42489C6.43862 4.02575 6.33931 2.88412 6.33931 2H8.54897C8.54897 2.62661 8.43724 3.77682 8.21379 5.45064C8.37931 5.38197 8.73517 5.21459 9.28138 4.9485C10.0262 4.59657 10.7131 4.29614 11.3421 4.04721L12 6.37768C11.0814 6.59227 10.0179 6.80258 8.80966 7.00858L10.2993 8.74678C10.5972 9.09871 10.8331 9.38627 11.0069 9.60944L9.10759 10.9099L7.43172 8.03863C6.9269 8.96567 6.34759 9.95279 5.69379 11Z"
                fill="#1F5AF6"
              />
            </svg>
            {t('import.viaSeed')}
          </Button>
        </div>

        <div className={styles.importButtonsItem}>
          <Button
            className={styles.importButton}
            disabled={!isLedgerSupported}
            view="transparent"
            onClick={() => {
              navigate('/import-ledger');
            }}
          >
            <div className={styles.importButtonIconWrapper}>
              <svg
                className={styles.importButtonIcon}
                width="20"
                height="21"
                fill="#000"
                stroke="#000"
                viewBox="0 0 20 21"
              >
                <path d="M19.254 3.558v8.446H8.122V.912h8.54c1.417 0 2.596 1.213 2.592 2.645v.001ZM3.329.912h1.017v3.663H.668V3.563c0-1.483 1.225-2.65 2.661-2.65ZM.668 8.406h3.678v3.662H.668V8.406Zm15.93 11.092H15.58V15.84h3.678v1.007c0 1.483-1.225 2.651-2.662 2.651ZM8.121 15.84H11.8v3.663H8.122V15.84ZM.668 16.852V15.84h3.678v3.663H3.329a2.665 2.665 0 0 1-2.661-2.651Z" />
              </svg>
              <svg
                className={styles.importButtonWaveIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <rect x="0.5" y="0.5" width="13" height="13" rx="6.5" fill="white"/>
                <rect x="0.5" y="0.5" width="13" height="13" rx="6.5" stroke="#E9E9EB"/>
                <rect x="2.05005" y="7" width="7" height="7" transform="rotate(-45 2.05005 7)" fill="#1F5AF6"/>
              </svg>
            </div>
            <div>
              <div>{t('import.viaLedger')}</div>
              {!isLedgerSupported && (
                <div className={styles.importButtonNote}>
                  {t('import.notSupportedByBrowser')}
                </div>
              )}
            </div>
          </Button>
        </div>

        <div className={styles.importButtonsItem}>
          <Button
            className={styles.importButton}
            data-testid="importKeystore"
            view="transparent"
            onClick={() => {
              navigate('/import-keystore');
            }}
          >
            <svg
              className={styles.importButtonIcon}
              fill="none"
              width="19"
              height="24"
              viewBox="0 0 19 24"
            >
              <path
                d="M0.899002 1.4411C0.899002 1.16496 1.12286 0.941101 1.399 0.941101H11.508C11.6337 0.941101 11.7548 0.988443 11.8472 1.0737L17.7381 6.51153L18.0773 6.14413L17.7381 6.51153C17.8407 6.60618 17.899 6.73938 17.899 6.87893V22.4411C17.899 22.7172 17.6751 22.9411 17.399 22.9411H1.399C1.12286 22.9411 0.899002 22.7172 0.899002 22.4411V1.4411Z"
                stroke="black"
              />
              <path
                d="M5.72913 10.695L3.41272 13.074L5.72913 15.3973"
                stroke="#0055FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.0689 15.4113L15.3853 13.0322L13.0689 10.7089"
                stroke="#0055FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="1"
                y1="-1"
                x2="6.6475"
                y2="-1"
                transform="matrix(-0.340081 0.940396 -0.937075 -0.349129 9.90149 9.1142)"
                stroke="#0055FF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M11.4406 5.92972V0.443692C11.4406 0.443692 11.7219 0.363355 12.248 0.805677C12.7741 1.248 17.7982 5.90773 18.0912 6.20076C18.3843 6.49378 18.3843 6.92972 18.3843 6.92972H12.4406C11.8883 6.92972 11.4406 6.482 11.4406 5.92972Z"
                fill="black"
              />
            </svg>
            {t('import.viaKeystore')}
          </Button>
        </div>

        {['mainnet', 'testnet'].includes(currentNetwork) && (
          <div className={styles.importButtonsItem}>
            <Button
              className={styles.importButton}
              data-testid="importEmail"
              view="transparent"
              onClick={() => {
                navigate('/import-email');
              }}
            >
              <div className={styles.importButtonIconWrapper}>
              <svg
                className={styles.importButtonIcon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M2.31339 6.43799L0.813385 8.43799V9.43799L4.31339 11.938H19.3134L22.8134 9.43799L21.8134 6.93799L13.3134 1.43799H10.3134L2.31339 6.43799Z"
                  fill="black"
                />
                <path
                  d="M11.8136 1.52887C9.72248 1.52887 0.798004 7.10463 0.798004 9.78817V21.3233C0.798004 21.9389 1.2677 22.438 1.84711 22.438H21.78C22.3594 22.438 22.8291 21.9389 22.8291 21.3233V9.52091C22.8291 7.10463 13.2073 1.52887 11.8136 1.52887Z"
                  stroke="black"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0.797958 9.91443L9.81334 15.71M22.8291 9.91443L14.3133 15.438"
                  stroke="black"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22.3134 21.938L11.8133 14.088L1.81339 21.938"
                  stroke="black"
                  strokeWidth="1.225"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0706 14.5092L11.8134 14.3549L11.5561 14.5092L9.33405 15.8425L3.13223 11.5093V4.08799C3.13223 3.729 3.42325 3.43799 3.78223 3.43799H19.7714C20.1304 3.43799 20.4214 3.729 20.4214 4.08799V11.511L14.2911 15.8415L12.0706 14.5092Z"
                  fill="white"
                  stroke="black"
                />
                <mask
                  id="mask0_512_14205"
                  style={{ maskType: 'alpha' }}
                  maskUnits="userSpaceOnUse"
                  x="2"
                  y="2"
                  width="19"
                  height="14"
                >
                  <path
                    d="M2.79164 4.22892C2.70695 3.5431 3.24194 2.93799 3.93297 2.93799H19.624C20.3139 2.93799 20.8485 3.5411 20.7657 4.22595L19.9178 11.2427L14.27 15.2491L11.841 13.7825L9.36338 15.2491L3.65771 11.2427L2.79164 4.22892Z"
                    fill="white"
                  />
                </mask>
                <g mask="url(#mask0_512_14205)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.8135 11.9834L16.8135 16.9834H6.81351L11.8135 11.9834Z"
                    fill="#5A81EA"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.8135 11.9834L16.8135 6.98343H6.81351L11.8135 11.9834Z"
                    fill="#E14B51"
                  />
                </g>
              </svg>
              <svg
                className={styles.importButtonWaveIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <rect x="0.5" y="0.5" width="13" height="13" rx="6.5" fill="white"/>
                <rect x="0.5" y="0.5" width="13" height="13" rx="6.5" stroke="#E9E9EB"/>
                <rect x="2.05005" y="7" width="7" height="7" transform="rotate(-45 2.05005 7)" fill="#1F5AF6"/>
              </svg>
            </div>

              {t('import.viaEmail')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
