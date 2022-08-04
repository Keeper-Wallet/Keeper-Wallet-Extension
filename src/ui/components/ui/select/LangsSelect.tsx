import * as React from 'react';
import * as styles from './LangsSelect.module.css';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { setLocale } from '../../../actions';
import { Select } from '../';
import cn from 'classnames';

export function LangsSelect() {
  const dispatch = useAppDispatch();
  const [langs, currentLocale] = useAppSelector(state => [
    state.langs,
    state.currentLocale,
  ]);

  return (
    <Select
      fill
      listPlacement="top"
      selectList={langs.map(({ id, name }) => ({
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
