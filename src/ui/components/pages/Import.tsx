import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import * as styles from './styles/import.styl';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, Modal } from '../ui';
import * as wavesKeeperLock from '../../assets/img/waves-keeper-lock.svg';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import { useAppDispatch, useAppSelector } from '../../store';
import background from 'ui/services/Background';

interface Props {
  setTab: (newTab: string) => void;
}

export function Import({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const showUpdateInfo = useAppSelector(
    state =>
      !state.uiState.isFeatureUpdateShown && !!state.allNetworksAccounts.length
  );
  const tabMode = useAppSelector(state => state.localState?.tabMode);

  const dismissFeatureInfo = () =>
    dispatch(setUiState({ isFeatureUpdateShown: true }));
  const exportToKeystore = () => setTab(PAGES.EXPORT_ACCOUNTS);

  const [isLedgerSupported, setIsLedgerSupported] = React.useState(false);

  React.useEffect(() => {
    TransportWebUSB.isSupported().then(setIsLedgerSupported);
  }, []);

  return (
    <div data-testid="importForm" className={styles.root}>
      <img
        className={styles.importIcon}
        src={wavesKeeperLock}
        alt=""
        width={220}
        height={200}
      />

      {tabMode === 'tab' ? (
        <>
          <Button
            data-testid="createNewAccountBtn"
            type="submit"
            view="submit"
            onClick={() => setTab(PAGES.NEW_ACCOUNT)}
          >
            <Trans i18nKey="import.createNew" />
          </Button>

          <div
            className={cn('body1', 'disabled500', 'font300', styles.separator)}
          >
            <Trans i18nKey="import.importVia">Or import via</Trans>
          </div>

          <div>
            <div className={styles.importButtonsItem}>
              <Button
                className={styles.importButton}
                data-testid="importSeed"
                type="button"
                view="transparent"
                onClick={() => setTab(PAGES.IMPORT_SEED)}
              >
                <svg
                  className={styles.importButtonIcon}
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                >
                  <rect
                    x="12.6011"
                    y="0.437988"
                    width="16.9706"
                    height="16.9706"
                    transform="rotate(45 12.6011 0.437988)"
                    fill="#0055FF"
                  />
                </svg>
                <Trans i18nKey="import.viaSeed" />
              </Button>
            </div>

            <div className={styles.importButtonsItem}>
              <Button
                className={styles.importButton}
                disabled={!isLedgerSupported}
                type="button"
                view="transparent"
                onClick={() => setTab(PAGES.IMPORT_LEDGER)}
              >
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
                <div>
                  <div>
                    <Trans i18nKey="import.viaLedger" />
                  </div>
                  {!isLedgerSupported && (
                    <div className={styles.importButtonNote}>
                      <Trans i18nKey="import.notSupportedByBrowser" />
                    </div>
                  )}
                </div>
              </Button>
            </div>

            <div className={styles.importButtonsItem}>
              <Button
                className={styles.importButton}
                data-testid="importKeystore"
                type="button"
                view="transparent"
                onClick={() => setTab(PAGES.IMPORT_KEYSTORE)}
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
                <Trans i18nKey="import.viaKeystore" />
              </Button>
            </div>

            {['mainnet', 'testnet'].includes(currentNetwork) && (
              <div className={styles.importButtonsItem}>
                <Button
                  className={styles.importButton}
                  data-testid="importEmail"
                  type="button"
                  view="transparent"
                  onClick={() => setTab(PAGES.IMPORT_EMAIL)}
                >
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

                  <Trans i18nKey="import.viaEmail" />
                  <div className={styles.importButtonBadge}>
                    <Trans i18nKey="import.beta" />
                  </div>
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        tabMode === 'popup' && (
          <>
            <p className="body1 disabled500 font300 center margin-main-big-top margin-main-large">
              <Trans i18nKey="import.noAccounts" values={{ currentNetwork }} />
            </p>
            <Button
              data-testid="addAccountBtn"
              type="submit"
              view="submit"
              onClick={() =>
                background.showTab(
                  `${window.location.origin}/accounts.html`,
                  'accounts'
                )
              }
            >
              <Trans i18nKey="import.addAccount" />
            </Button>
          </>
        )
      )}

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showUpdateInfo}>
        <FeatureUpdateInfo
          onClose={dismissFeatureInfo}
          onSubmit={() => {
            dismissFeatureInfo();
            exportToKeystore();
          }}
        />
      </Modal>
    </div>
  );
}
