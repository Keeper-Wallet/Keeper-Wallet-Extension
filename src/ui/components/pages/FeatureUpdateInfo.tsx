import * as React from 'react';
import { Button } from '../ui';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import * as styles from './featureUpdateInfo.styl';
import background from '../../../ui/services/Background';

export function FeatureUpdateInfo({ onClose, onSubmit }) {
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

        <p className={cn('margin1', 'body1')}>
          <Trans i18nKey="featureUpdateInfo.intro" />
        </p>

        <p className={cn('margin1', 'body1')}>
          <Trans i18nKey="featureUpdateInfo.recommendation" />
        </p>

        <p className={cn('margin1', 'body1')}>
          <Trans i18nKey="featureUpdateInfo.keystoreInfo" />
        </p>

        <p className={cn('margin-main-big', 'body1')}>
          <Trans i18nKey="featureUpdateInfo.keystoreImport" />
        </p>

        <Button
          type="submit"
          onClick={() =>
            background.sendEvent('click', { id: 'featureUpdateInfo.backupBtn' })
          }
        >
          <Trans i18nKey="featureUpdateInfo.backupBtn" />
        </Button>

        <Button
          className="modal-close"
          onClick={preventDefault(function close() {
            background.sendEvent('click', {
              id: 'featureUpdateInfo.closeBtn',
            });
            onClose();
          })}
          type="transparent"
        />
      </form>
    </div>
  );
}
