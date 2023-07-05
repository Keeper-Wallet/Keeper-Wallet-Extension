import { usePopupSelector } from 'popup/store/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { icontains } from 'ui/components/pages/assets/helpers';

import { Avatar, Button, Copy, Ellipsis, Modal, SearchInput } from '../ui';
import { AddModal } from '../ui/Address/AddModal';
import { DeleteModal } from '../ui/Address/DeleteModal';
import { EditModal } from '../ui/Address/EditModal';
import { Tooltip } from '../ui/tooltip';
import * as styles from './AddressBook.module.css';
import { MoreActions } from './assets/moreActions';

interface AddressCardProps {
  address: string;
  name: string;
}

function AddressCard({ address, name }: AddressCardProps) {
  const { t } = useTranslation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  return (
    <div className={styles.card}>
      <Avatar className={styles.cardAvatar} size={40} address={address} />
      <div className={styles.cardContent}>
        <p className={styles.cardName}>{name}</p>
        <Ellipsis className={styles.cardAddress} text={address} size={14} />
      </div>
      <MoreActions>
        <Tooltip content={t('copyAddress')}>
          {props => (
            <Copy
              text={address}
              onCopy={() => {
                setShowCopyNotification(true);
                setTimeout(() => setShowCopyNotification(false), 1000);
              }}
            >
              <button className={styles.copyButton} {...props}>
                <svg className={styles.copyIcon} viewBox="0 0 14 14">
                  <path d="M13.025 0H4.876a.976.976 0 0 0-.974.975v8.149c0 .537.437.974.974.974h8.15A.976.976 0 0 0 14 9.124V.974A.976.976 0 0 0 13.025 0zm-.296 8.827H5.173V1.271h7.556v7.556zM8.827 12.73H1.271V5.173h2.136V3.902H.975A.976.976 0 0 0 0 4.876v8.15c0 .537.437.974.975.974h8.149a.976.976 0 0 0 .974-.975v-2.432h-1.27v2.136z" />
                </svg>
              </button>
            </Copy>
          )}
        </Tooltip>
        <Tooltip content={t('address.edit')}>
          {props => (
            <button
              className={styles.editButton}
              onClick={() => {
                setShowEditModal(true);
              }}
              {...props}
            >
              <svg className={styles.editIcon} viewBox="0 0 14 14">
                <path d="M8.462 3.003l2.44 2.453-6.178 6.208-2.44-2.452 6.178-6.21zm4.293-.592l-1.088-1.094a1.076 1.076 0 0 0-1.526 0L9.098 2.365l2.44 2.453 1.217-1.222a.84.84 0 0 0 0-1.185zM1.007 12.661a.278.278 0 0 0 .336.331l2.72-.662-2.44-2.453-.616 2.783z" />
              </svg>
            </button>
          )}
        </Tooltip>
        <Tooltip content={t('address.delete')}>
          {props => (
            <button
              className={styles.deleteButton}
              onClick={() => {
                setShowDeleteModal(true);
              }}
              {...props}
            >
              <svg className={styles.deleteIcon} viewBox="0 0 18 18">
                <path d="M16.354 3.679h-4.053V1.594A.6.6 0 0 0 11.694 1H6.308a.6.6 0 0 0-.607.594v2.085H1.646a.6.6 0 0 0-.607.594c0 .326.273.593.607.593h1.5l.962 11.588c.027.308.29.546.605.546h8.574a.6.6 0 0 0 .605-.546l.963-11.588h1.5a.6.6 0 0 0 .606-.594.6.6 0 0 0-.607-.593zm-9.44-1.492h4.173v1.492H6.915V2.187zm5.814 13.626H5.274l-.91-10.947h9.273l-.909 10.947z" />
                <path d="M10.48 13.505a.6.6 0 0 1-.607-.594V7.67a.6.6 0 0 1 .607-.594.6.6 0 0 1 .607.594v5.24a.6.6 0 0 1-.607.595zM7.52 13.505a.6.6 0 0 1-.607-.594V7.67a.6.6 0 0 1 .608-.594.6.6 0 0 1 .607.594v5.24a.6.6 0 0 1-.607.595z" />
              </svg>
            </button>
          )}
        </Tooltip>
      </MoreActions>

      <EditModal
        name={name}
        address={address}
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        setShowDeleteModal={setShowDeleteModal}
      />
      <DeleteModal
        address={address}
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
      />

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showCopyNotification}
      >
        <div className="modal notification">
          <div>{t('address.copied')}</div>
        </div>
      </Modal>
    </div>
  );
}

export function AddressBook() {
  const { t } = useTranslation();

  const addresses = usePopupSelector(state => state.addresses);

  const [search, setSearch] = useState('');
  const addressList = useMemo(
    () =>
      Object.entries(addresses)
        .filter(
          ([address, name]) =>
            icontains(address, search) || icontains(name, search),
        )
        .sort(([, firstName], [, secondName]) =>
          firstName.localeCompare(secondName),
        ),
    [addresses, search],
  );

  const [showAddModal, setShowAddModal] = useState(false);

  const addHandler = () => {
    setShowAddModal(true);
  };

  return (
    <div className={styles.content}>
      <div className={styles.head}>
        <h2 className="title1">{t('address.title')}</h2>
        <Tooltip content={t('address.addTooltip')} placement="auto-end">
          {props => (
            <button
              className={styles.addButtonIcon}
              onClick={addHandler}
              type="button"
              {...props}
            />
          )}
        </Tooltip>
      </div>
      {Object.keys(addresses).length === 0 ? (
        <div className={styles.empty}>
          <p className={`headline2Bold ${styles.emptyTitle}`}>
            {t('address.emptyTitle')}
          </p>
          <p className={`basic500 ${styles.emptyDescription}`}>
            {t('address.emptyDescription')}
          </p>
          <Button
            view="submit"
            className={styles.addButton}
            onClick={addHandler}
          >
            {t('address.addButton')}
          </Button>
        </div>
      ) : (
        <div className={styles.serp}>
          <SearchInput
            className={styles.searchInput}
            value={search}
            onInput={e => setSearch(e.currentTarget.value)}
            onClear={() => setSearch('')}
          />
          <div className={styles.cardList}>
            {addressList.length > 0 ? (
              addressList.map(([address, name]) => (
                <AddressCard key={address} address={address} name={name} />
              ))
            ) : (
              <p className={styles.notFound}>{t('address.notFound')}</p>
            )}
          </div>
        </div>
      )}
      <AddModal showModal={showAddModal} setShowModal={setShowAddModal} />
    </div>
  );
}
