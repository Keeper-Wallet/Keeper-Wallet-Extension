import { validators } from '@waves/waves-transactions';
import clsx from 'clsx';
import { usePopupSelector } from 'popup/store/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { processAliasOrAddress } from 'transactions/utils';
import {
  fromEthereumToWavesAddress,
  fromWavesToEthereumAddress,
  isEthereumAddress,
  isValidEthereumAddress,
} from 'ui/utils/ethereum';

import { Ellipsis } from '../../ui';
import { Tooltip } from '../tooltip';
import { AddModal } from './AddModal';
import * as styles from './Recipient.module.css';
import { AddressTooltip } from './Tooltip';

export interface Props {
  className?: string;
  recipient: string;
  chainId: number;
  showAliasWarning?: boolean;
  showMirrorAddress?: boolean;
  testid?: string;
}

export function AddressRecipient({
  className,
  recipient,
  chainId,
  showAliasWarning = true,
  showMirrorAddress,
  testid,
}: Props) {
  const { t } = useTranslation();
  const address = isEthereumAddress(recipient)
    ? recipient
    : processAliasOrAddress(recipient, chainId);

  const accounts = usePopupSelector(state => state.accounts);
  const addresses = usePopupSelector(state => state.addresses);

  const name =
    accounts.find(account => account.address === address)?.name ||
    addresses[address];

  const [showAddModal, setShowAddModal] = useState(false);

  const [type, mirrorAddress] = useMemo(() => {
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
          // eslint-disable-next-line react/no-danger
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
        <div className={clsx(styles.content, className)} data-testid={testid}>
          <div className={styles.name}>{name}</div>
          <AddressTooltip address={address} />
        </div>
      ) : (
        <div className={clsx(styles.content, className)} data-testid={testid}>
          {showMirrorAddress ? (
            <Tooltip
              className={clsx(styles.mirrorAddress, {
                [styles.ethereum]: type === 'ethereum',
                [styles.waves]: type === 'waves',
              })}
              content={mirrorAddress}
              placement="auto-end"
            >
              {props => (
                <div className={styles.recipientWrapper} {...props}>
                  <Ellipsis
                    text={address}
                    size={12}
                    className={clsx(styles.recipient, {
                      [styles.ethereum]: type === 'ethereum',
                      [styles.waves]: type === 'waves',
                    })}
                  />
                </div>
              )}
            </Tooltip>
          ) : (
            <Tooltip content={address} placement="auto-end">
              {props => (
                <div className={styles.recipientWrapper} {...props}>
                  <Ellipsis
                    text={address}
                    size={12}
                    className={styles.recipient}
                  />
                </div>
              )}
            </Tooltip>
          )}
          <Tooltip content={t('address.addTooltip')} placement="auto-end">
            {props => (
              <i
                className={styles.addButtonIcon}
                onClick={() => {
                  setShowAddModal(true);
                }}
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
