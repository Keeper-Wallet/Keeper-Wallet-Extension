import { isAddressString, isAlias } from 'messages/utils';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setAddress } from 'store/actions/addresses';

import { Button, ErrorMessage, Input, Modal } from '../';
import * as styles from './AddModal.module.css';
import { AddressInput } from './Input';

interface Props {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  address?: string;
}

export function AddModal({ showModal, setShowModal, address }: Props) {
  const { t } = useTranslation();

  const dispatch = usePopupDispatch();
  const addresses = usePopupSelector(state => state.addresses);

  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [addressValue, setAddressValue] = useState('');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (showModal) {
      return;
    }

    setLoading(false);
    setName('');
    setNameError('');
    setAddressValue('');
    setAddressError('');
  }, [showModal, setShowModal]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    if (address ? addresses[address] : addresses[addressValue]) {
      return;
    }

    setShowModal(false);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 1000);
  }, [addresses, address, addressValue, loading, setShowModal]);

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
              {t('address.add')}
            </p>
            <form
              className={styles.form}
              onSubmit={e => {
                e.preventDefault();

                const foundName = Object.values(addresses).find(
                  addressName => addressName === name,
                );
                if (foundName) {
                  setNameError(t('address.nameAlreadyExist'));
                  return;
                }

                if (
                  /^\s/g.test(name) ||
                  isAddressString(name) ||
                  isAlias(name)
                ) {
                  setNameError(t('address.nameInvalidError'));
                  return;
                }

                if (address) {
                  dispatch(setAddress({ address, name }));
                  setLoading(true);
                  return;
                }

                if (addresses[addressValue]) {
                  setAddressError(t('address.addressAlreadyExist'));
                  return;
                }

                if (!isAddressString(addressValue)) {
                  setAddressError(t('address.addressInvalidError'));
                  return;
                }

                dispatch(setAddress({ address: addressValue, name }));
                setLoading(true);
              }}
            >
              <p className={`basic500 ${styles.subtitle}`}>
                {t('address.name')}
              </p>
              <div className={styles.name}>
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  value={name}
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
                onChange={e => {
                  setAddressValue(e.target.value);
                  setAddressError('');
                }}
                value={address || addressValue}
                disabled={!!address}
                addressError={addressError}
                showMirrorAddress
              />
              <Button
                type="submit"
                view="submit"
                className={styles.button}
                disabled={!name || (!address && !addressValue)}
              >
                {t('address.save')}
              </Button>
            </form>
          </div>
        </div>
      </Modal>
      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={showNotification}
      >
        <div className="modal notification">
          <div>{t('address.added')}</div>
        </div>
      </Modal>
    </>
  );
}
