import clsx from 'clsx';
import { SUPPORTED_LANGUAGES } from 'i18n/constants';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';

import { setLocale } from '../../../../store/actions/user';
import { Select } from '../';
import * as styles from './LangsSelect.module.css';

export function LangsSelect() {
  const dispatch = usePopupDispatch();
  const currentLocale = usePopupSelector(state => state.currentLocale);

  return (
    <Select
      fill
      listPlacement="top"
      selectList={SUPPORTED_LANGUAGES.map(({ id, name }) => ({
        id,
        value: id,
        text: name,
        icon: (
          <i
            className={clsx(styles.flagIcon, `flag-${id}-icon`, {
              [styles.selected]: currentLocale === id,
            })}
          />
        ),
      }))}
      selected={currentLocale}
      onSelectItem={locale => {
        if (currentLocale === locale) {
          return;
        }

        dispatch(setLocale(locale as string));
      }}
    />
  );
}
