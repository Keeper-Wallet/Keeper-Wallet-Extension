import * as styles from './AddModal.module.css';
import * as React from 'react';
import { validators } from '@waves/waves-transactions';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { setAddress } from 'ui/actions';
import { isValidEthereumAddress } from 'ui/utils/ethereum';
import { AddressInput } from './Input';
import { Modal, Input, Error, Button } from '../';

interface Props {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  address?: string;
}

export function AddModal({ showModal, setShowModal, address }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const addresses = useAppSelector(state => state.addresses);

  const [loading, setLoading] = React.useState(false);
  const [showNotification, setShowNotification] = React.useState(false);

  const [name, setName] = React.useState('');
  const [nameError, setNameError] = React.useState('');

  const [addressValue, setAddressValue] = React.useState('');
  const [addressError, setAddressError] = React.useState('');

  React.useEffect(() => {
    if (showModal) {
      return;
    }

    setLoading(false);
    setName('');
    setNameError('');
    setAddressValue('');
    setAddressError('');
  }, [showModal, setShowModal]);

  React.useEffect(() => {
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
                  addressName => addressName === name
                );
                if (foundName) {
                  setNameError(t('address.nameAlreadyExist'));
                  return;
                }

                if (
                  /^\s/g.test(name) ||
                  validators.isValidAddress(name) ||
                  validators.isValidAlias(name) ||
                  isValidEthereumAddress(name)
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

                if (
                  !validators.isValidAddress(addressValue) &&
                  !isValidEthereumAddress(addressValue)
                ) {
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
                <Error className={styles.error} show={!!nameError}>
                  {nameError}
                </Error>
              </div>
              <p className={`basic500 ${styles.subtitle}`}>
                {t('address.subtitle')}
              </p>
              <AddressInput
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
