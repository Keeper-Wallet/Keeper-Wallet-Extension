import styles from './DeleteModal.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'ui/store';
import { removeAddress } from 'ui/actions';
import { Modal, Button } from '..';

interface Props {
  address: string;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export function DeleteModal({ address, showModal, setShowModal }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  return (
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
            {t('address.delete')}
          </p>
          <p className={`basic500 ${styles.description}`}>
            {t('address.deleteDescription')}
          </p>
          <Button
            view="submit"
            className={styles.cancelButton}
            onClick={() => {
              setShowModal(false);
            }}
          >
            {t('address.cancel')}
          </Button>
          <Button
            className={styles.button}
            onClick={() => {
              dispatch(removeAddress({ address }));
              setShowModal(false);
            }}
          >
            {t('address.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
