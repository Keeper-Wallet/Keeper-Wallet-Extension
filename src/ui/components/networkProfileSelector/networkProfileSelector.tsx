import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PROFILES } from '../../../networks/config';
import { NetworkName, NetworkProfile } from '../../../networks/types';
import { capitalize } from '../../../nfts/utils';
import { usePopupDispatch, usePopupSelector } from '../../../popup/store/react';
import { ACTION, createAction } from '../../../store/actions/constants';
import { setLoading } from '../../../store/actions/localState';
import Background from '../../services/Background';
import { Button } from '../ui';
import * as styles from './networkProfileSelector.module.css';

const setCurrentProfile = createAction(ACTION.UPDATE_CURRENT_PROFILE);
const setCurrentNetwork = createAction(ACTION.UPDATE_CURRENT_NETWORK);

interface ProfileButtonProps {
  id: NetworkProfile;
  name: string;
  setSelected: (id: NetworkProfile) => void;
  selected: boolean;
}

const ProfileButton = ({
  id,
  name,
  setSelected,
  selected,
}: ProfileButtonProps) => {
  const className = clsx(styles.profileButton, {
    [styles.selected]: selected,
  });

  const iconClass = clsx(styles.networkIcon, {
    'selected-lang': selected,
    [`network-${id.toLowerCase()}-icon`]: !selected,
  });

  return (
    <div
      className={className}
      onClick={() => {
        setSelected(id);
      }}
    >
      <div className={`${styles.selectButton} fullwidth body1 left`}>
        {name}
      </div>
      <div className={iconClass} />
    </div>
  );
};

interface Props {
  allowChangingNetwork?: boolean;
  className?: string;
}

export function NetworkProfileSelector({
  allowChangingNetwork = true,
  className,
}: Props) {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const currentNetworkId = usePopupSelector(
    state => state.currentNetwork as string,
  );
  const selectedAccount = usePopupSelector(state => state.selectedAccount);

  const getProfileFromNetworkId = (networkId: string): NetworkProfile => {
    if (
      networkId.includes('testnet') ||
      networkId.includes('stagenet') ||
      networkId === 'all-testnet'
    ) {
      return NetworkProfile.Testnet;
    }
    return NetworkProfile.Mainnet;
  };

  const currentProfileDisplay = getProfileFromNetworkId(currentNetworkId);

  const [selectedProfile, setSelectedProfile] = useState<NetworkProfile>(
    currentProfileDisplay,
  );

  const setNewProfile = async (profile: NetworkProfile) => {
    dispatch(setLoading(true));

    try {
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

      dispatch(setCurrentProfile(currentProfileDisplay));
      dispatch(setCurrentNetwork(currentNetworkId));
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 500);
    }
  };

  const availableProfiles: Array<NetworkProfile> = [
    NetworkProfile.Mainnet,
    NetworkProfile.Testnet,
  ];

  const showConfirmButton = selectedProfile !== currentProfileDisplay;

  return (
    <div className={clsx(styles.content, className)}>
      <div className={styles.profilesList}>
        {availableProfiles.map(profile => {
          const profileName = capitalize(profile);
          if (!profileName) {
            return;
          }

          const isSelected =
            profile === selectedProfile ||
            (profile === currentProfileDisplay &&
              selectedProfile === currentProfileDisplay);

          return (
            <ProfileButton
              key={profile}
              id={profile}
              name={profileName}
              setSelected={setSelectedProfile}
              selected={isSelected}
            />
          );
        })}
      </div>

      {showConfirmButton && (
        <div className={styles.confirmButton}>
          <Button
            disabled={!allowChangingNetwork}
            onClick={() => {
              if (
                !allowChangingNetwork ||
                selectedProfile === currentProfileDisplay
              ) {
                return;
              }
              setNewProfile(selectedProfile);
            }}
            type="submit"
            view="submit"
          >
            {t('networkSettings.confirm')}
          </Button>
        </div>
      )}
    </div>
  );
}
