import * as React from 'react';
import * as styles from './bottom.module.css';
import cn from 'classnames';
import { Network } from './components';
import { useAppSelector } from 'ui/store';

export function Bottom({ className, noChangeNetwork, hide }) {
  const version = useAppSelector(state => state.version);
  const isLocked = useAppSelector(
    state => state.state?.locked || !state.state?.initialized
  );

  return (
    !isLocked &&
    !hide && (
      <div className={cn(styles.bottom, className)}>
        <Network noChangeNetwork={noChangeNetwork} />
        <div className="version basic500">v {version}</div>
      </div>
    )
  );
}
