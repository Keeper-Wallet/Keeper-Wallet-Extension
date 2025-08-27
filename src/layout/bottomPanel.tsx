import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Browser from 'webextension-polyfill';

import { NETWORK_CONFIG } from '../constants';
import { NetworkName } from '../networks/types';
import { usePopupDispatch, usePopupSelector } from '../popup/store/react';
import { setLoading } from '../store/actions/localState';
import {
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
  setNetwork,
} from '../store/actions/network';
import { Modal } from '../ui/components/ui';
import { Tooltip } from '../ui/components/ui/tooltip';
import * as styles from './bottomPanel.module.css';
import { CustomNetworkModal } from './customNetworkModal';
import { BLOCKCHAIN_TYPES, NETWORK_TYPES } from '../assets/constants';
import {
  getAvailableNetworkOptions,
  getNetworkDisplayName,
  isNetworkSelected,
} from '../networks/networkOptions';
import background from '../ui/services/Background';
import { PreferencesAccount } from '../preferences/types';
import { useAccountsSelector } from '../accounts/store/react';
import { ACTION } from '../store/actions/constants';

interface Props {
  allowChangingNetwork?: boolean;
}

export function BottomPanel({ allowChangingNetwork }: Props) {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const customMatcher = usePopupSelector(state => state.customMatcher);
  const customNodes = usePopupSelector(state => state.customNodes);
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType || BLOCKCHAIN_TYPES.WAVES,
  );
  const [hideTestAccounts, setHideTestAccounts] = useState<boolean>(false);
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  const accounts = useAccountsSelector(state => state.accounts);
  const [isWavesOnlyAccount, setIsWavesOnlyAccount] = useState(false);

  const setNewNetwork = async (network: NetworkName, blockchain: string) => {
    dispatch(setLoading(true));
    await dispatch(setNetwork(network));
    await background.setCurrentBlockchainType(blockchain);
    dispatch({
      type: ACTION.UPDATE_CURRENT_BLOCKCHAIN_TYPE,
      payload: blockchain,
    });
    setTimeout(() => dispatch(setLoading(false)), 1000);
  };

  const [isDropdownShown, setIsDropdownShown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Check if the account is Waves-only when component mounts or selected account changes
  useEffect(() => {
    const checkIfWavesOnly = async () => {
      try {
        // Legacy accounts are Waves-only by default
        if (!selectedAccount?.walletId) {
          setIsWavesOnlyAccount(true);
          return;
        }

        // For MultiWallet accounts, get the full wallet data from background
        // Find the wallet that matches the selected account's walletId
        const wallet = accounts.find(
          wallet =>
            (wallet as PreferencesAccount & { id: string }).id ===
            selectedAccount.walletId,
        );
        setIsWavesOnlyAccount(!!wallet?.isWavesOnly);
      } catch (error) {
        console.error('Error checking if account is Waves-only:', error);
        setIsWavesOnlyAccount(false);
      }
    };

    checkIfWavesOnly();
  }, [selectedAccount?.walletId, accounts]);

  useEffect(() => {
    // Load the hideTestAccounts preference when component mounts
    (async () => {
      const hideTestAccountsPref = await background.getHideTestAccounts();
      setHideTestAccounts(hideTestAccountsPref);
    })();
  }, []);
  useEffect(() => {
    const dropdownEl = dropdownRef.current;

    if (!isDropdownShown || !dropdownEl) return;

    const handleWindowClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        dropdownEl.contains(event.target)
      ) {
        return;
      }

      setIsDropdownShown(false);
    };

    addEventListener('click', handleWindowClick, {
      capture: true,
    });

    return () => {
      removeEventListener('click', handleWindowClick, {
        capture: true,
      });
    };
  }, [isDropdownShown]);

  const [isCustomNetworkModalShown, setIsCustomNetworkModalShown] =
    useState(false);

  // Get all available network options using the shared utility and filter as needed
  const networkOptions = getAvailableNetworkOptions(
    currentBlockchainType,
    currentNetwork,
    !hideTestAccounts,
    t,
  ).filter(option => {
    // If it's a Waves-only account, filter out Unit0 options
    if (isWavesOnlyAccount && option.blockchain === BLOCKCHAIN_TYPES.UNIT0) {
      return false;
    }
    return true;
  });

  // Get the currently selected network for display
  const currentNetworkDisplayName = getNetworkDisplayName(
    currentBlockchainType,
    currentNetwork,
    t,
  );

  return (
    <div className={styles.root}>
      <Tooltip
        className={styles.networkTooltipContent}
        content={t('bottom.network.disabled')}
      >
        {props => (
          <div
            className={styles.network}
            {...(allowChangingNetwork ? undefined : props)}
          >
            <button
              className={styles.dropdownButton}
              disabled={!allowChangingNetwork}
              onClick={() => {
                setIsDropdownShown(true);
              }}
            >
              <i className={clsx(styles.networkIcon, 'networkIcon')} />

              <span className={styles.dropdownButtonText}>
                {/* Use the full display name for the current selection */}
                {currentNetworkDisplayName}
              </span>
            </button>

            {currentNetwork === NetworkName.Custom && (
              <button
                className={styles.editButton}
                disabled={!allowChangingNetwork}
                onClick={() => {
                  setIsCustomNetworkModalShown(true);
                }}
              >
                {t('bottom.network.edit')}
              </button>
            )}

            {isDropdownShown && (
              <div ref={dropdownRef} className={styles.dropdown}>
                {networkOptions
                  .filter(option => {
                    // Filter out current selection to place at the end
                    return !isNetworkSelected(
                      option,
                      currentBlockchainType,
                      currentNetwork,
                    );
                  })
                  // Add current selection at the end
                  .concat(
                    networkOptions.find(option =>
                      isNetworkSelected(
                        option,
                        currentBlockchainType,
                        currentNetwork,
                      ),
                    ) || {
                      blockchain: currentBlockchainType,
                      network: currentNetwork,
                      isTestnet: currentNetwork !== NetworkName.Mainnet,
                      displayName: currentNetworkDisplayName,
                      value: `${currentBlockchainType}-${currentNetwork}`,
                    },
                  )
                  .map(option => {
                    const isSelected = isNetworkSelected(
                      option,
                      currentBlockchainType,
                      currentNetwork,
                    );

                    return (
                      <button
                        key={option.value}
                        className={clsx(styles.dropdownItem, {
                          [styles.dropdownItem_selected]: isSelected,
                        })}
                        onClick={
                          isSelected
                            ? undefined
                            : () => {
                                setIsDropdownShown(false);
                                if (option.network === NETWORK_TYPES.CUSTOM) {
                                  setIsCustomNetworkModalShown(true);
                                } else {
                                  // Update network using both network and blockchain properties
                                  setNewNetwork(
                                    option.network as NetworkName,
                                    option.blockchain,
                                  );
                                }
                              }
                        }
                      >
                        <i
                          className={clsx(styles.networkIcon, 'networkIcon')}
                        />

                        <i
                          className={clsx(
                            styles.networkIconActive,
                            'networkIconActive',
                          )}
                        />

                        {/* Use "Custom Network" for custom networks, otherwise use display name */}
                        {option.network === NETWORK_TYPES.CUSTOM
                          ? 'Custom Network'
                          : option.displayName}
                      </button>
                    );
                  })}
              </div>
            )}

            <Modal
              showModal={isCustomNetworkModalShown}
              animation={Modal.ANIMATION.FLASH}
            >
              <CustomNetworkModal
                initialMatcher={
                  customMatcher[NetworkName.Custom] ||
                  NETWORK_CONFIG[NetworkName.Custom].matcherBaseUrl
                }
                initialNode={
                  customNodes[NetworkName.Custom] ||
                  NETWORK_CONFIG[NetworkName.Custom].nodeBaseUrl
                }
                onClose={() => {
                  setIsCustomNetworkModalShown(false);
                }}
                onSave={({ matcher, networkCode, node }) => {
                  dispatch(
                    setCustomCode({
                      code: networkCode,
                      network: NetworkName.Custom,
                    }),
                  );

                  dispatch(
                    setCustomNode({
                      network: NetworkName.Custom,
                      node,
                    }),
                  );

                  if (matcher) {
                    dispatch(
                      setCustomMatcher({
                        matcher,
                        network: NetworkName.Custom,
                      }),
                    );
                  }

                  setIsCustomNetworkModalShown(false);

                  if (currentNetwork !== NetworkName.Custom) {
                    setNewNetwork(NetworkName.Custom, currentBlockchainType);
                  }
                }}
              />
            </Modal>
          </div>
        )}
      </Tooltip>

      <div className="version basic500" data-testid="currentVersion">
        v {Browser.runtime.getManifest().version}
      </div>
    </div>
  );
}
