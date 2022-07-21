import * as React from 'react';
import styles from './bottom.module.css';
import cn from 'classnames';
import { Network } from './components';
import { useAppSelector } from 'ui/store';

interface Props {
  className?: string;
  noChangeNetwork?: boolean;
  hide?: boolean;
}

export function Bottom({ className, noChangeNetwork, hide }: Props) {
  const version = useAppSelector(state => state.version);
  const isLocked = useAppSelector(
    state => state.state?.locked || !state.state?.initialized
  );

  return (
    !isLocked &&
    !hide && (
      <div className={cn(styles.bottom, className)}>
        <Network noChangeNetwork={noChangeNetwork} />
        <div className="version basic500" data-testid="currentVersion">
          v {version}
        </div>
      </div>
    )
  );
}
