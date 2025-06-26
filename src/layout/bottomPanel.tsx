import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Browser from 'webextension-polyfill';

import { NETWORK_CONFIGS, PROFILES } from '../networks/config';
import { NetworkName, NetworkProfile } from '../networks/types';
import { capitalize } from '../nfts/utils';
import { usePopupDispatch, usePopupSelector } from '../popup/store/react';
import { ACTION, createAction } from '../store/actions/constants';
import { setLoading } from '../store/actions/localState';
import {
  setCustomCode,
  setCustomMatcher,
  setCustomNode,
} from '../store/actions/network';
import { Modal } from '../ui/components/ui';
import { Tooltip } from '../ui/components/ui/tooltip';
import Background from '../ui/services/Background';
import * as styles from './bottomPanel.module.css';
import { CustomNetworkModal } from './customNetworkModal';

const setCurrentProfile = createAction(ACTION.UPDATE_CURRENT_PROFILE);
const setCurrentNetwork = createAction(ACTION.UPDATE_CURRENT_NETWORK);

interface Props {
  allowChangingNetwork?: boolean;
}

export function BottomPanel({ allowChangingNetwork }: Props) {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const currentProfile = usePopupSelector(
    state => state.currentProfile as NetworkProfile,
  );
  const currentNetworkId = usePopupSelector(
    state => state.currentNetwork as string,
  );
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  const customMatcher = usePopupSelector(
    state => state.customMatcher as Partial<Record<string, string | null>>,
  );
  const customNodes = usePopupSelector(
    state => state.customNodes as Partial<Record<string, string | null>>,
  );

  const getProfileFromNetworkId = (networkId: string): NetworkProfile => {
    if (
      networkId === 'custom' ||
      networkId.includes('testnet') ||
      networkId.includes('stagenet') ||
      networkId === 'all-testnet'
    ) {
      return NetworkProfile.Testnet;
    }
    return NetworkProfile.Mainnet;
  };

  const actualCurrentProfile = getProfileFromNetworkId(currentNetworkId);

  const setNewProfile = async (profile: NetworkProfile | 'Custom') => {
    dispatch(setLoading(true));

    try {
      if (profile === 'Custom') {
        dispatch(setCurrentProfile(NetworkProfile.Testnet));
        dispatch(setCurrentNetwork('custom'));

        await Background.setProfile(NetworkProfile.Testnet);
        await Background.setNetworkById('custom');
        await Background.setNetwork(NetworkProfile.Testnet);
      } else {
        dispatch(setCurrentProfile(profile));

        const profileConfig = PROFILES.find(p => p.profile === profile);
        if (profileConfig && profileConfig.networks.length > 0) {
          let defaultNetwork;

          if (profile === NetworkProfile.Mainnet) {
            if (selectedAccount?.accountType === 'multichain') {
              defaultNetwork =
                profileConfig.networks.find(n => n.id === 'all-mainnet') ||
                profileConfig.networks.find(n => n.id === 'waves-mainnet') ||
                profileConfig.networks[0];
            } else {
              defaultNetwork =
                profileConfig.networks.find(n => n.id === 'waves-mainnet') ||
                profileConfig.networks[0];
            }
          } else {
            if (selectedAccount?.accountType === 'multichain') {
              const hasWavesAccount = !!selectedAccount.accounts?.waves;
              const hasUnit0Account = !!(
                selectedAccount.accounts?.ethereum ||
                selectedAccount.accounts?.unit0
              );

              if (hasWavesAccount) {
                defaultNetwork = profileConfig.networks.find(
                  n => n.id === 'waves-testnet',
                );
              } else if (hasUnit0Account) {
                defaultNetwork = profileConfig.networks.find(
                  n => n.id === 'unit0-testnet',
                );
              } else {
                defaultNetwork = profileConfig.networks.find(
                  n => n.id === 'custom',
                );
              }

              if (!defaultNetwork) {
                defaultNetwork = profileConfig.networks[0];
              }
            } else {
              defaultNetwork =
                profileConfig.networks.find(n => n.id === 'waves-testnet') ||
                profileConfig.networks[0];
            }
          }

          if (defaultNetwork) {
            dispatch(setCurrentNetwork(defaultNetwork.id));

            await Background.setProfile(profile);
            await Background.setNetworkById(defaultNetwork.id);

            if (defaultNetwork.networkName === NetworkName.Mainnet) {
              await Background.setNetwork(NetworkProfile.Mainnet);
            } else {
              await Background.setNetwork(NetworkProfile.Testnet);
            }
          }
        }
      }

      try {
        await Background.updateCurrentAccountBalance();
      } catch (balanceError) {
        console.warn(
          'Failed to update balance after profile switch:',
          balanceError,
        );
      }
    } catch (error) {
      console.error('Failed to set profile:', error);

      dispatch(setCurrentProfile(actualCurrentProfile));
      dispatch(setCurrentNetwork(currentNetworkId));
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 500);
    }
  };

  const [isProfileDropdownShown, setIsProfileDropdownShown] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const profileDropdownEl = profileDropdownRef.current;

    const handleWindowClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        (profileDropdownEl && profileDropdownEl.contains(event.target))
      ) {
        return;
      }

      setIsProfileDropdownShown(false);
    };

    if (isProfileDropdownShown) {
      addEventListener('click', handleWindowClick, {
        capture: true,
      });

      return () => {
        removeEventListener('click', handleWindowClick, {
          capture: true,
        });
      };
    }
  }, [isProfileDropdownShown]);

  const [isCustomNetworkModalShown, setIsCustomNetworkModalShown] =
    useState(false);

  const availableProfiles: Array<NetworkProfile | 'Custom'> =
    currentNetworkId === 'custom'
      ? [NetworkProfile.Mainnet, NetworkProfile.Testnet, 'Custom']
      : [NetworkProfile.Mainnet, NetworkProfile.Testnet];

  const customNetworkConfig = NETWORK_CONFIGS.custom;

  const getCurrentProfileDisplay = () => {
    if (currentNetworkId === 'custom') return 'Custom';
    return capitalize(actualCurrentProfile);
  };

  const getProfileDisplayName = (profile: NetworkProfile | 'Custom') => {
    if (profile === 'Custom') return 'Custom';
    return capitalize(profile);
  };

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
                setIsProfileDropdownShown(true);
              }}
            >
              <i className={clsx(styles.networkIcon, 'networkIcon')} />
              <span className={styles.dropdownButtonText}>
                {getCurrentProfileDisplay()}
              </span>
            </button>

            {isProfileDropdownShown && (
              <div ref={profileDropdownRef} className={styles.dropdown}>
                {availableProfiles.map((profile: NetworkProfile | 'Custom') => {
                  const isSelected =
                    profile === actualCurrentProfile ||
                    (profile === 'Custom' && currentNetworkId === 'custom');
                  return (
                    <button
                      key={profile}
                      className={clsx(styles.dropdownItem, {
                        [styles.dropdownItem_selected]: isSelected,
                      })}
                      onClick={
                        isSelected
                          ? () => setIsProfileDropdownShown(false)
                          : () => {
                              setIsProfileDropdownShown(false);
                              setNewProfile(profile);
                            }
                      }
                    >
                      <i className={clsx(styles.networkIcon, 'networkIcon')} />
                      <i
                        className={clsx(
                          styles.networkIconActive,
                          'networkIconActive',
                        )}
                      />
                      {getProfileDisplayName(profile)}
                    </button>
                  );
                })}
              </div>
            )}

            {currentNetworkId === 'custom' && (
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

            <Modal
              showModal={isCustomNetworkModalShown}
              animation={Modal.ANIMATION.FLASH}
            >
              <CustomNetworkModal
                initialMatcher={customMatcher.custom || ''}
                initialNode={
                  customNodes.custom || customNetworkConfig?.params.rpcUrl || ''
                }
                onClose={() => {
                  setIsCustomNetworkModalShown(false);
                }}
                onSave={({ matcher, networkCode, node }) => {
                  dispatch(
                    setCustomCode({
                      code: networkCode,
                      network: 'custom',
                    }),
                  );
                  dispatch(
                    setCustomNode({
                      network: 'custom',
                      node,
                    }),
                  );
                  if (matcher) {
                    dispatch(
                      setCustomMatcher({
                        matcher,
                        network: 'custom',
                      }),
                    );
                  }
                  setIsCustomNetworkModalShown(false);
                  if (currentNetworkId !== 'custom') {
                    setNewProfile('Custom');
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
