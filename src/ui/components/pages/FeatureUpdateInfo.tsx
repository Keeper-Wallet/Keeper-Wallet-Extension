import * as React from 'react';
import { Button } from '../ui';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import * as styles from './featureUpdateInfo.styl';
import background from '../../../ui/services/Background';

export function FeatureUpdateInfo({
  onClose,
  onSubmit,
}: {
  onClose: (...args: unknown[]) => unknown;
  onSubmit: (...args: unknown[]) => unknown;
}) {
  const { t } = useTranslation();

  function preventDefault(func: () => void) {
    return function (evt) {
      evt.preventDefault();
      func();
    };
  }

  return (
    <div className="modal cover">
      <form className="modal-form" onSubmit={preventDefault(onSubmit)}>
        <i className={`lock-icon ${styles.lockIcon}`} />

        <p className={cn('margin1', 'body1')}>{t('featureUpdateInfo.intro')}</p>

        <p className={cn('margin1', 'body1')}>
          {t('featureUpdateInfo.recommendation')}
        </p>

        <p className={cn('margin1', 'body1')}>
          {t('featureUpdateInfo.keystoreInfo')}
        </p>

        <p className={cn('margin-main-big', 'body1')}>
          {t('featureUpdateInfo.keystoreImport')}
        </p>

        <Button
          type="submit"
          view="submit"
          onClick={() =>
            background.sendEvent('click', { id: 'featureUpdateInfo.backupBtn' })
          }
        >
          {t('featureUpdateInfo.backupBtn')}
        </Button>

        <Button
          className="modal-close"
          onClick={preventDefault(function close() {
            background.sendEvent('click', {
              id: 'featureUpdateInfo.closeBtn',
            });
            onClose();
          })}
          type="button"
          view="transparent"
        />
      </form>
    </div>
  );
}
