import { captureException } from '@sentry/browser';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom';
import { deleteNotifications } from 'store/actions/notifications';
import { ExportButton, ResetButton } from 'ui/components/ui';
import Background from 'ui/services/Background';

import { HeadLogo } from '../head';
import * as styles from './errorPage.module.css';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const dispatch = usePopupDispatch();
  const activePopup = usePopupSelector(state => state.activePopup);

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      if (error.status !== 404 && error.error) {
        captureException(error.error);
      }
    } else {
      captureException(error);
    }

    if (activePopup) {
      if (activePopup.msg) {
        Background.reject(activePopup.msg.id);
      }

      if (activePopup.notify) {
        dispatch(deleteNotifications(activePopup.notify.map(x => x.id))).then(
          () => {
            navigate('/messages-and-notifications');
          },
        );
      }
    }
  }, [activePopup, dispatch, error, navigate]);

  return (
    <div className={styles.wrapper}>
      <HeadLogo className={styles.logo} />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('errorPage.title')}</h2>

        <p className={styles.name}>
          {isRouteErrorResponse(error)
            ? error.statusText
            : error instanceof Error
            ? error.message
            : String(error)}
        </p>
      </div>

      <div className={styles.footer}>
        <ExportButton />

        <div className={styles.buttons}>
          <ResetButton />
        </div>
      </div>
    </div>
  );
}
