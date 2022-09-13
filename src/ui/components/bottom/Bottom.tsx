import * as React from 'react';
import * as styles from './bottom.module.css';
import { Network } from './components';
import { useAppSelector } from 'ui/store';

interface Props {
  hide?: boolean;
  noChangeNetwork?: boolean;
}

export function Bottom({ hide, noChangeNetwork }: Props) {
  const version = useAppSelector(state => state.version);
  const isLocked = useAppSelector(
    state => state.state?.locked || !state.state?.initialized
  );

  return !isLocked && !hide ? (
    <div className={styles.bottom}>
      <Network noChangeNetwork={noChangeNetwork} />
      <div className="version basic500" data-testid="currentVersion">
        v {version}
      </div>
    </div>
  ) : null;
}
