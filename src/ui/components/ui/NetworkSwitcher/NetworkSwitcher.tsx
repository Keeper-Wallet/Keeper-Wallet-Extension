import {
    type NetworkFilter,
    type NetworkFilterOption,
    NetworkProfile,
} from 'networks/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { isMultichainAccount } from 'preferences/types';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ACTION, createAction } from 'store/actions/constants';
import Background from 'ui/services/Background';

import { Select, type SelectItem } from '../select/Select';
import * as styles from './NetworkSwitcher.module.css';

const setSelectedNetworkFilter = createAction(
  ACTION.UPDATE_SELECTED_NETWORK_FILTER,
);

export function NetworkSwitcher() {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  const selectedNetworkFilter = usePopupSelector(
    state => state.selectedNetworkFilter,
  );
  const currentProfile = usePopupSelector(state => state.currentProfile);
  const currentNetworkId = usePopupSelector(state => state.currentNetwork);
  const appState = usePopupSelector(state => state.state);

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

  const switchToNetwork = async (networkId: string) => {
    try {
      await Background.setNetworkById(networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

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
          const validMainnetFilters: NetworkFilter[] = [
            'all',
            'waves',
            'unit0',
          ];

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

  const isVisible = useMemo(() => {
    return selectedAccount && appState?.initialized && !appState?.locked;
  }, [selectedAccount, appState]);

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
            label: 'Custom',
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
          label: 'Custom',
        });

        return options;
      }
    }

    return [];
  }, [selectedAccount, actualCurrentProfile, t]);

  const selectList = useMemo((): Array<SelectItem<NetworkFilter>> => {
    return networkOptions.map(option => ({
      id: option.value,
      text: option.label,
      value: option.value,
    }));
  }, [networkOptions]);

  const handleNetworkChange = async (
    id: string | number,
    value: NetworkFilter,
  ) => {
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

  if (!isVisible) {
    return null;
  }

  if (networkOptions.length <= 1 && selectedAccount?.accountType !== 'waves') {
    return null;
  }

  return (
    <div className={styles.networkSwitcher}>
      <Select
        selected={selectedNetworkFilter}
        selectList={selectList}
        onSelectItem={handleNetworkChange}
        className={styles.select}
        theme="compact"
      />
    </div>
  );
}
