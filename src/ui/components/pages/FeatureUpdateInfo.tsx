import * as React from 'react';
import { Button } from '../ui';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import * as styles from './featureUpdateInfo.styl';

export function FeatureUpdateInfo({ onClose, onSubmit }) {
    return (
        <div className="modal cover">
            <form
                className="modal-form"
                onSubmit={(evt) => {
                    evt.preventDefault();
                    onSubmit();
                }}
            >
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

                <p className={cn('margin1', 'body1')}>
                    <Trans i18nKey="featureUpdateInfo.keystoreImport" />
                </p>

                <Button className="margin1" type="submit">
                    <Trans i18nKey="featureUpdateInfo.backupBtn" />
                </Button>

                <Button onClick={onClose} type="button">
                    <Trans i18nKey="featureUpdateInfo.cancelBtn" />
                </Button>
            </form>
        </div>
    );
}
