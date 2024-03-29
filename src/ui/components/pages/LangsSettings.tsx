import clsx from 'clsx';
import { SUPPORTED_LANGUAGES } from 'i18n/constants';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { setLocale } from '../../../store/actions/user';
import { Button } from '../ui';
import * as styles from './LangsSettings.module.css';

interface LangProps {
  id: string;
  name: string;
  setSelected: (id: string) => void;
  selected: boolean;
}

const Lang = ({ id, name, setSelected, selected }: LangProps) => {
  const className = clsx(styles[id], styles.lang, {
    [styles.selected]: selected,
  });
  const iconClass = clsx(styles.flagIcon, {
    'selected-lang': selected,
    [`flag-${id}-icon`]: !selected,
  });

  return (
    <div
      className={className}
      onClick={() => {
        setSelected(id);
      }}
    >
      <div className={`${styles.selectButton} fullwidth body1 left`}>
        {name}
      </div>
      <div className={iconClass} />
    </div>
  );
};

export const LangsSettings = () => {
  const { t } = useTranslation();

  const dispatch = usePopupDispatch();
  const currentLocale = usePopupSelector(state => state.currentLocale);

  const [selected, setSelected] = useState(currentLocale);

  return (
    <div className={styles.content}>
      <h2 className="title1 margin-main-big">{t('langsSettings.title')}</h2>
      <div className={styles.langsList}>
        {SUPPORTED_LANGUAGES.map(({ id, name }) => {
          return (
            <Lang
              id={id}
              key={id}
              name={name}
              setSelected={setSelected}
              selected={id === selected}
            />
          );
        })}
      </div>
      {currentLocale !== selected && (
        <div className={styles.langsConfirm}>
          <Button
            onClick={() => {
              if (currentLocale === selected) {
                return;
              }

              dispatch(setLocale(selected));
            }}
            type="submit"
            view="submit"
          >
            {t('langsSettings.confirm')}
          </Button>
        </div>
      )}
    </div>
  );
};
