import { validators } from '@waves/waves-transactions';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { removeAddress, setAddress } from 'store/actions/addresses';

import { Button, ErrorMessage, Input, Modal } from '..';
import * as styles from './EditModal.module.css';
import { AddressInput } from './Input';

interface Props {
  name: string;
  address: string;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  setShowDeleteModal?: (showModal: boolean) => void;
}

export function EditModal({
  name,
  address,
  showModal,
  setShowModal,
  setShowDeleteModal,
}: Props) {
  const { t } = useTranslation();

  const dispatch = usePopupDispatch();
  const addresses = usePopupSelector(state => state.addresses);

  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const [nameValue, setNameValue] = useState(name);
  const [nameError, setNameError] = useState('');

  const [addressValue, setAddressValue] = useState(address);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (showModal) {
      return;
    }

    setLoading(false);
    setNameValue(name);
    setNameError('');
    setAddressValue(address);
    setAddressError('');
  }, [name, address, showModal, setShowModal]);

  useEffect(() => {
    if (loading && (name !== nameValue || address !== addressValue)) {
      setShowModal(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1000);
    }
  }, [
    addresses,
    name,
    nameValue,
    address,
    addressValue,
    loading,
    setShowModal,
  ]);

  return (
    <>
      <Modal animation={Modal.ANIMATION.FLASH} showModal={showModal}>
        <div className={`modal cover ${styles.modal}`}>
          <div className={styles.content}>
            <Button
              className="modal-close"
              type="button"
              view="transparent"
              onClick={() => {
                setShowModal(false);
              }}
            />
            <p className={`headline2Bold ${styles.title}`}>
              {t('address.edit')}
            </p>
            <form
              className={styles.form}
              onSubmit={e => {
                e.preventDefault();

                const foundName = Object.values(addresses).find(
                  addressName => addressName === nameValue
                );
                if (name !== nameValue && foundName) {
                  setNameError(t('address.nameAlreadyExist'));
                  return;
                }

                if (
                  /^\s/g.test(nameValue) ||
                  validators.isValidAddress(nameValue) ||
                  validators.isValidAlias(nameValue)
                ) {
                  setNameError(t('address.nameInvalidError'));
                  return;
                }

                if (address !== addressValue && addresses[addressValue]) {
                  setAddressError(t('address.addressAlreadyExist'));
                  return;
                }

                if (!validators.isValidAddress(addressValue)) {
                  setAddressError(t('address.addressInvalidError'));
                  return;
                }

                dispatch(
                  setAddress({ address: addressValue, name: nameValue })
                );
                if (name !== nameValue && address !== addressValue) {
                  dispatch(removeAddress({ address }));
                }
                setLoading(true);
              }}
            >
              <p className={`basic500 ${styles.subtitle}`}>
                {t('address.name')}
              </p>
              <div className={styles.name}>
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNameValue(e.target.value);
                    setNameError('');
                  }}
                  value={nameValue}
                  maxLength={35}
                  autoFocus
                  error={!!nameError}
                />
                <ErrorMessage className={styles.error} show={!!nameError}>
                  {nameError}
                </ErrorMessage>
              </div>
              <p className={`basic500 ${styles.subtitle}`}>
                {t('address.subtitle')}
              </p>
              <AddressInput
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setAddressValue(e.target.value);
                  setAddressError('');
                }}
                value={addressValue}
                addressError={addressError}
                showMirrorAddress
              />
              <Button
                type="submit"
                view="submit"
                className={styles.button}
                disabled={
                  !nameValue ||
                  !addressValue ||
                  (name === nameValue && address === addressValue)
                }
              >
                {t('address.saveChanges')}
              </Button>
              {setShowDeleteModal && (
                <Button
                  className={styles.deleteButton}
                  onClick={() => {
                    setShowModal(false);
                    setShowDeleteModal(true);
                  }}
                >
                  {t('address.delete')}
                </Button>
              )}
            </form>
          </div>
        </div>
      </Modal>
      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showNotification}
      >
        <div className="modal notification">
          <div>{t('address.edited')}</div>
        </div>
      </Modal>
    </>
  );
}
