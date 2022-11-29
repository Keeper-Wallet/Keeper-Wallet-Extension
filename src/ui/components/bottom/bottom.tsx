import Browser from 'webextension-polyfill';

import * as styles from './bottom.module.css';
import { Network } from './components';

interface Props {
  allowChangingNetwork?: boolean;
}

export function Bottom({ allowChangingNetwork }: Props) {
  return (
    <div className={styles.bottom}>
      <Network allowChangingNetwork={allowChangingNetwork} />
      <div className="version basic500" data-testid="currentVersion">
        v {Browser.runtime.getManifest().version}
      </div>
    </div>
  );
}
