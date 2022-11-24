import cn from 'classnames';
import { SUPPORTED_LANGUAGES } from 'i18n/constants';
import { useAppDispatch, useAppSelector } from 'ui/store';

import { setLocale } from '../../../actions/user';
import { Select } from '../';
import * as styles from './LangsSelect.module.css';

export function LangsSelect() {
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector(state => state.currentLocale);

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
            className={cn(styles.flagIcon, `flag-${id}-icon`, {
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
