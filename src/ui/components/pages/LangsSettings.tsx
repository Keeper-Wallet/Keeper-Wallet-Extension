import styles from './LangsSettings.module.css';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { setLocale } from '../../actions';
import cn from 'classnames';

interface LangProps {
  id: string;
  name: string;
  setSelected: (id: string) => void;
  selected: boolean;
}

const Lang = ({ id, name, setSelected, selected }: LangProps) => {
  const className = cn(styles[id], styles.lang, {
    [styles.selected]: selected,
  });
  const iconClass = cn(styles.flagIcon, {
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

  const dispatch = useAppDispatch();
  const [langs, currentLocale] = useAppSelector(state => [
    state.langs,
    state.currentLocale,
  ]);

  const [selected, setSelected] = React.useState(currentLocale);

  return (
    <div className={styles.content}>
      <h2 className="title1 margin-main-big">{t('langsSettings.title')}</h2>
      <div className={styles.langsList}>
        {langs.map(({ id, name }) => {
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
