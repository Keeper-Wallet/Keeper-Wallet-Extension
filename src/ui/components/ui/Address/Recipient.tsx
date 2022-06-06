import * as styles from './Recipient.module.css';
import * as React from 'react';
import { validators } from '@waves/waves-transactions';
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
        <div className={`${styles.content} ${className}`} data-testid={testid}>
          <p className={styles.name}>{name}</p>
          <AddressTooltip address={address} />
        </div>
      ) : (
        <div className={`${styles.content} ${className}`} data-testid={testid}>
          <p className={styles.recipient}>{address}</p>
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
