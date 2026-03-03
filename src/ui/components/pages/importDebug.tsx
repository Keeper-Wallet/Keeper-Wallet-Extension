import { isAddressString } from 'messages/utils';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createAccount } from 'store/actions/user';
import * as styles from 'ui/components/pages/importDebug.module.css';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import Background, { WalletTypes } from 'ui/services/Background';

import { NETWORK_CONFIG } from '../../../constants';
import { type MultiWallet } from '../../../services/types';

function isValidUnit0Address(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function ImportDebug() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.accounts);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const customCodes = usePopupSelector(state => state.customCodes);

  // Get all wallets to check for duplicate addresses across all networks
  const [allWallets, setAllWallets] = useState<MultiWallet[]>([]);

  useEffect(() => {
    Background.getMultiWallets().then(setAllWallets);
  }, []);

  const networkCode =
    customCodes[currentNetwork] || NETWORK_CONFIG[currentNetwork].networkCode;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [unit0Address, setUnit0Address] = useState('');

  const nameError = useMemo(() => {
    if (!name) {
      return t('importDebug.requiredError');
    }

    if (accounts.some(account => account.name === name)) {
      return t('importDebug.alreadyExists');
    }

    return null;
  }, [name, accounts, t]);

  const addressError = useMemo(() => {
    if (!address) {
      return t('importDebug.requiredError');
    }

    if (!isAddressString(address, networkCode.charCodeAt(0))) {
      return t('importDebug.invalidAddressError', {
        networkName: currentNetwork,
      });
    }

    // Check if address already exists in any wallet (across all networks)
    const addressExistsInWallet = allWallets.some(wallet => {
      // Check waves networks
      const wavesNetworks = wallet.coins?.waves?.networks;
      if (wavesNetworks) {
        if (
          wavesNetworks.mainnet?.address === address ||
          wavesNetworks.testnet?.address === address ||
          wavesNetworks.stagenet?.address === address ||
          wavesNetworks.custom?.address === address
        ) {
          return true;
        }
      }
      return false;
    });

    if (addressExistsInWallet) {
      return t('importDebug.alreadyExists');
    }

    return null;
  }, [address, allWallets, currentNetwork, networkCode, t]);

  const unit0AddressError = useMemo(() => {
    if (!unit0Address) {
      return null;
    }

    if (!isValidUnit0Address(unit0Address)) {
      return t('importDebug.invalidUnit0AddressError');
    }

    // Check if unit0 address already exists in any wallet
    const addressExistsInWallet = allWallets.some(wallet => {
      const unit0Networks = wallet.coins?.unit0?.networks;
      if (unit0Networks) {
        if (
          unit0Networks.mainnet?.address === unit0Address ||
          unit0Networks.testnet?.address === unit0Address
        ) {
          return true;
        }
      }
      return false;
    });

    if (addressExistsInWallet) {
      return t('importDebug.alreadyExists');
    }

    return null;
  }, [unit0Address, allWallets, t]);

  const [showErrors, setShowErrors] = useState<boolean>(false);

  return (
    <div className={styles.content}>
      <h2 className="margin1 title1">{t('importDebug.title')}</h2>

      <form
        onSubmit={async e => {
          e.preventDefault();

          setShowErrors(true);

          if (nameError || addressError || unit0AddressError) {
            return;
          }

          await dispatch(
            createAccount(
              {
                type: 'debug',
                address,
                name,
                ...(unit0Address && { unit0Address }),
              },
              WalletTypes.Debug,
            ),
          );

          navigate('/import-success');
        }}
      >
        <div className="margin1">
          <label className="input-title basic500 tag1" htmlFor="accountName">
            {t('importDebug.nameInput')}
          </label>
          <Input
            id="accountName"
            className="margin1"
            onChange={e => setName(e.target.value)}
            value={name}
            maxLength={32}
            autoFocus
            error={showErrors && !!nameError}
          />
          <ErrorMessage show={showErrors && !!nameError}>
            {nameError}
          </ErrorMessage>
        </div>

        <div className="margin4">
          <label className="input-title basic500 tag1" htmlFor="accountAddress">
            {t('importDebug.addressInput')}
          </label>
          <Input
            id="accountAddress"
            className="margin1"
            onChange={e => setAddress(e.target.value)}
            value={address}
            maxLength={35}
            error={showErrors && !!addressError}
          />
          <ErrorMessage show={showErrors && !!addressError}>
            {addressError}
          </ErrorMessage>
        </div>

        <div className="margin4">
          <label className="input-title basic500 tag1" htmlFor="unit0Address">
            {t('importDebug.unit0AddressInput')}{' '}
            <span className="basic500">({t('importDebug.optional')})</span>
          </label>
          <Input
            id="unit0Address"
            className="margin1"
            onChange={e => setUnit0Address(e.target.value)}
            value={unit0Address}
            maxLength={42}
            placeholder="0x..."
            error={showErrors && !!unit0AddressError}
          />
          <ErrorMessage show={showErrors && !!unit0AddressError}>
            {unit0AddressError}
          </ErrorMessage>
        </div>

        <div>
          <Button
            data-testid="continueBtn"
            id="continue"
            type="submit"
            view="submit"
          >
            {t('importDebug.continueBtn')}
          </Button>
        </div>
      </form>
    </div>
  );
}
