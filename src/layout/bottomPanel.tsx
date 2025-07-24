import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Browser from 'webextension-polyfill';

import { NETWORK_CONFIGS } from '../networks/config';
import {
  type NetworkFilter,
  type NetworkFilterOption,
  NetworkProfile,
} from '../networks/types';
import { capitalize } from '../nfts/utils';
import { usePopupDispatch, usePopupSelector } from '../popup/store/react';
import { isMultichainAccount } from '../preferences/types';
import { ACTION, createAction } from '../store/actions/constants';
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

interface Props {
  allowChangingNetwork?: boolean;
}

type Profile = {
  text: string;
  id: string;
  value: NetworkFilter;
};

const setSelectedNetworkFilter = createAction(
  ACTION.UPDATE_SELECTED_NETWORK_FILTER,
);

export function BottomPanel({ allowChangingNetwork }: Props) {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const selectedAccount = usePopupSelector(state => state.selectedAccount);

  const currentNetworkId = usePopupSelector(
    state => state.currentNetwork,
  );
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedNetworkFilter = usePopupSelector(state => state.selectedNetworkFilter);
  const customMatcher = usePopupSelector(
    state => state.customMatcher as Partial<Record<string, string | null>>,
  );
  const customNodes = usePopupSelector(
    state => state.customNodes as Partial<Record<string, string | null>>,
  );
  const [isCustomNetworkModalShown, setIsCustomNetworkModalShown] =
    useState(false);
  const [isProfileDropdownShown, setIsProfileDropdownShown] = useState(false);

  const customNetworkConfig = NETWORK_CONFIGS.custom;

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

  const actualCurrentProfile = getProfileFromNetworkId(
    currentNetworkId as string,
  );

  const networkOptions = useMemo((): NetworkFilterOption[] => {
    if (!selectedAccount) return [];

    if (selectedAccount.accountType === 'waves') {
      if (actualCurrentProfile === NetworkProfile.Mainnet) {
        return [
          {
            value: 'waves',
            label: 'Waves',
          },
        ];
      } else {
        return [
          {
            value: 'waves-testnet',
            label: 'Waves Testnet',
          },
          {
            value: 'waves-stagenet',
            label: 'Waves Stagenet',
          },
          {
            value: 'custom',
            label: 'Waves Custom',
          },
        ];
      }
    }

    if (isMultichainAccount(selectedAccount)) {
      if (actualCurrentProfile === NetworkProfile.Mainnet) {
        const options: NetworkFilterOption[] = [
          {
            value: 'all',
            label: t('networks.allNetworks', 'All Networks'),
          },
        ];

        if (selectedAccount.accounts.waves) {
          options.push({
            value: 'waves',
            label: 'Waves',
          });
        }

        if (
          selectedAccount.accounts.ethereum ||
          selectedAccount.accounts.unit0
        ) {
          options.push({
            value: 'unit0',
            label: 'Unit0',
          });
        }

        return options;
      } else {
        const options: NetworkFilterOption[] = [];

        if (selectedAccount.accounts.waves) {
          options.push({
            value: 'waves-testnet',
            label: 'Waves Testnet',
          });
          options.push({
            value: 'waves-stagenet',
            label: 'Waves Stagenet',
          });
        }

        if (
          selectedAccount.accounts.ethereum ||
          selectedAccount.accounts.unit0
        ) {
          options.push({
            value: 'unit0-testnet',
            label: 'Unit0 Testnet',
          });
        }

        options.push({
          value: 'custom',
          label: 'Waves Custom',
        });

        return options;
      }
    }

    return [];
  }, [selectedAccount, actualCurrentProfile, t]);

  const availableProfiles = useMemo((): Profile[] => {
    return networkOptions.map(option => ({
      id: option.value,
      text: option.label,
      value: option.value,
    }));
  }, [networkOptions]);

  const getProfileDisplayName = (profile: Profile) => {
    return capitalize(profile.text);
  };

  const switchToNetwork = async (networkId: string) => {
    try {
      await Background.setNetworkById(networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleNetworkChange = async (
    id: string | number,
    value: NetworkFilter,
  ) => {
    setIsProfileDropdownShown(false);
    dispatch(setSelectedNetworkFilter(value));
    if (actualCurrentProfile === NetworkProfile.Testnet) {
      let targetNetworkId = '';

      switch (value) {
        case 'waves-testnet':
          targetNetworkId = 'waves-testnet';
          break;
        case 'waves-stagenet':
          targetNetworkId = 'waves-stagenet';
          break;
        case 'unit0-testnet':
          targetNetworkId = 'unit0-testnet';
          break;
        case 'custom':
          targetNetworkId = 'custom';
          break;
        default:
          targetNetworkId = 'waves-testnet';
      }

      if (targetNetworkId && targetNetworkId !== currentNetworkId) {
        await switchToNetwork(targetNetworkId);
      }
    }
  };

  const currentProfile = availableProfiles.find(
    profile => profile.id === selectedNetworkFilter,
  );

  useEffect(() => {
    if (!selectedAccount) return;
    const handleNetworkSync = async () => {
      if (
        selectedAccount.accountType === 'waves' &&
        actualCurrentProfile === NetworkProfile.Mainnet
      ) {
        if (selectedNetworkFilter !== 'waves') {
          dispatch(setSelectedNetworkFilter('waves'));
        }
        return;
      }

      if (
        selectedAccount.accountType === 'waves' &&
        actualCurrentProfile === NetworkProfile.Testnet
      ) {
        let targetFilter: NetworkFilter = 'waves-testnet';

        if (currentNetworkId === 'waves-stagenet') {
          targetFilter = 'waves-stagenet';
        } else if (currentNetworkId === 'custom') {
          targetFilter = 'custom';
        }

        if (selectedNetworkFilter !== targetFilter) {
          dispatch(setSelectedNetworkFilter(targetFilter));
        }
        return;
      }

      if (isMultichainAccount(selectedAccount)) {
        if (actualCurrentProfile === NetworkProfile.Mainnet) {
          const validMainnetFilters: string[] = ['all', 'waves', 'unit0'];

          if (!validMainnetFilters.includes(selectedNetworkFilter)) {
            dispatch(setSelectedNetworkFilter('all'));
            return;
          }

          if (
            selectedNetworkFilter === 'waves' &&
            !selectedAccount.accounts.waves
          ) {
            dispatch(setSelectedNetworkFilter('all'));
          }
        } else {
          let expectedFilter: NetworkFilter = 'waves-testnet';

          if (currentNetworkId === 'waves-testnet') {
            expectedFilter = 'waves-testnet';
          } else if (currentNetworkId === 'waves-stagenet') {
            expectedFilter = 'waves-stagenet';
          } else if (currentNetworkId === 'unit0-testnet') {
            expectedFilter = 'unit0-testnet';
          } else if (currentNetworkId === 'custom') {
            expectedFilter = 'custom';
          } else if (currentNetworkId === 'all-testnet') {
            expectedFilter = 'waves-testnet';
          }

          const hasWavesAccount = !!selectedAccount.accounts.waves;
          const hasUnit0Account = !!(
            selectedAccount.accounts.ethereum || selectedAccount.accounts.unit0
          );

          if (
            (expectedFilter === 'waves-testnet' ||
              expectedFilter === 'waves-stagenet') &&
            !hasWavesAccount
          ) {
            if (hasUnit0Account) {
              expectedFilter = 'unit0-testnet';
              await switchToNetwork('unit0-testnet');
            } else {
              expectedFilter = 'custom';
              await switchToNetwork('custom');
            }
          } else if (expectedFilter === 'unit0-testnet' && !hasUnit0Account) {
            if (hasWavesAccount) {
              expectedFilter = 'waves-testnet';
              await switchToNetwork('waves-testnet');
            } else {
              expectedFilter = 'custom';
              await switchToNetwork('custom');
            }
          }

          if (selectedNetworkFilter !== expectedFilter) {
            dispatch(setSelectedNetworkFilter(expectedFilter));
          }
        }
      }
    };

    handleNetworkSync().catch(console.error);
  }, [
    selectedAccount,
    selectedNetworkFilter,
    actualCurrentProfile,
    currentNetworkId,
    dispatch,
    switchToNetwork,
  ]);

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
              {!!currentProfile && (
                <span className={styles.dropdownButtonText}>
                  {capitalize(currentProfile.text)}
                </span>
              )}
            </button>

            {isProfileDropdownShown && (
              <div ref={profileDropdownRef} className={styles.dropdown}>
                {availableProfiles.map(profile => {
                  const profileId = profile.id || profile;
                  const isSelected =
                    profileId === currentNetworkId ||
                    profileId === actualCurrentProfile ||
                    (profileId === 'custom' && currentNetworkId === 'custom');
                  return (
                    <button
                      key={profileId as string}
                      className={clsx(styles.dropdownItem, {
                        [styles.dropdownItem_selected]: isSelected,
                      })}
                      onClick={() =>
                        handleNetworkChange(profile.id, profile.value)
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
                  dispatch(
                    setCustomMatcher({
                      matcher: matcher ?? '',
                      network: 'custom',
                    }),
                  );
                  setIsCustomNetworkModalShown(false);
                  if (currentNetworkId !== 'custom') {
                    // setNewProfile('Custom');
                    // Sync network filter with the correct value
                    dispatch(setSelectedNetworkFilter('custom'));
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
