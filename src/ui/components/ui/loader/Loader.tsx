import * as React from 'react';
import * as styles from './loader.styl';

export function Loader(props) {
  if (props.hide) {
    return null;
  }

  return <div className={styles.loader} />;
}
