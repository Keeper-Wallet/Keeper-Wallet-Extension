import clsx from 'clsx';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { setIdle } from '../../../store/actions/localState';
import { Button, Select } from '../ui';
import * as styles from './styles/settings.styl';

export function SettingsGeneral() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idle = usePopupSelector<Record<string, any>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state => (state.config as any)?.idle || {},
  );

  const idleOptions = usePopupSelector(state => state.idleOptions);

  const selectList = Object.entries(idle)
    .sort(([, a], [, b]) => a - b)
    .map(([id, value]) => ({
      id,
      value,
      text: t(`settings.time_${id}`, { defaultValue: id, key: id }),
    }));

  return (
    <div className={styles.content}>
      <div className={`${styles.title1} title1`}>
        {t('settings.settingsGeneral')}
      </div>

      <div className={styles.settingsMenu}>
        <div className="margin-main-big">
          <Select
            description={t('settings.sessionTimeout')}
            fill
            selectList={selectList}
            selected={idleOptions.type}
            onSelectItem={(id: string | number) =>
              dispatch(setIdle(id as string))
            }
          />
        </div>

        <div className={clsx(styles.settingsMenuItem, styles.password)}>
          <Button
            id="changePassword"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/change-password');
            }}
          >
            <div className="body1 left">{t('settings.password')}</div>
          </Button>
        </div>
      </div>
    </div>
  );
}
