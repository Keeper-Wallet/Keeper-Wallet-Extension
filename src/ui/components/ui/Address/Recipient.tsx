import * as styles from './Recipient.module.css';
import * as React from 'react';
import cn from 'classnames';
import { validators } from '@waves/waves-transactions';
import {
  isValidEthereumAddress,
  fromEthereumToWavesAddress,
  fromWavesToEthereumAddress,
} from 'ui/utils/ethereum';
import { processAliasOrAddress } from 'transactions/utils';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'ui/store';
import { Tooltip } from '../tooltip';
import { AddModal } from './AddModal';
import { AddressTooltip } from './Tooltip';

export interface Props {
  className?: string;
  recipient: string;
  chainId: number;
  showAliasWarning?: boolean;
  testid?: string;
}

export function AddressRecipient({
  className,
  recipient,
  chainId,
  showAliasWarning = true,
  testid,
}: Props) {
  const { t } = useTranslation();
  const address = processAliasOrAddress(recipient, chainId);

  const accounts = useAppSelector(state => state.accounts);
  const addresses = useAppSelector(state => state.addresses);

  const name =
    accounts.find(account => account.address === address)?.name ||
    addresses[address];

  const [showAddModal, setShowAddModal] = React.useState(false);

  const [type, mirrorAddress] = React.useMemo(() => {
    switch (true) {
      case isValidEthereumAddress(address):
        return ['ethereum', fromEthereumToWavesAddress(address, chainId)];
      case validators.isValidAddress(address):
        return ['waves', fromWavesToEthereumAddress(address)];
      default:
        return [];
    }
  }, [address, chainId]);

  if (validators.isValidAlias(address)) {
    return (
      <div className={className}>
        <p
          className={styles.name}
          data-testid={testid}
          dangerouslySetInnerHTML={{
            __html: address.replace(/^alias:\w:/i, '<mark>$&</mark>'),
          }}
        />
        {showAliasWarning && (
          <p className={styles.warningAlias}>{t('address.warningAlias')}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {name ? (
        <div className={cn(styles.content, className)} data-testid={testid}>
          <p className={styles.name}>{name}</p>
          <AddressTooltip address={address} />
        </div>
      ) : (
        <div className={cn(styles.content, className)} data-testid={testid}>
          <Tooltip
            className={cn(styles.mirrorAddress, {
              [styles.ethereum]: type === 'ethereum',
              [styles.waves]: type === 'waves',
            })}
            content={mirrorAddress}
            placement="auto-end"
          >
            {props => (
              <p
                className={cn(styles.recipient, {
                  [styles.ethereum]: type === 'ethereum',
                  [styles.waves]: type === 'waves',
                })}
                {...props}
              >
                {address}
              </p>
            )}
          </Tooltip>
          <Tooltip content={t('address.addTooltip')} placement="auto-end">
            {props => (
              <button
                className={styles.addButtonIcon}
                onClick={() => {
                  setShowAddModal(true);
                }}
                type="button"
                {...props}
              />
            )}
          </Tooltip>
        </div>
      )}
      <AddModal
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        address={address}
      />
    </>
  );
}
