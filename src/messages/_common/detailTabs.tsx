import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { CheckIcon } from 'icons/check';
import { CopyIcon } from 'icons/copy';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Highlight } from 'ui/components/ui/highlight/highlight';
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from 'ui/components/ui/Tabs/Tabs';

import * as styles from './detailTabs.module.css';

interface Props {
  children?: React.ReactNode;
  json: string;
}

export function TxDetailTabs({ children, json }: Props) {
  const { t } = useTranslation();
  const [copyFeedback, setCopyFeedback] = useState(false);

  return (
    <Tabs>
      <TabList className="body3">
        <Tab>{t('transactions.details')}</Tab>
        <Tab>{t('transactions.json')}</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>{children}</TabPanel>

        <TabPanel>
          <div className={styles.root}>
            <div className={styles.copyBtnWrapper}>
              <button
                className={clsx(styles.copyBtn, {
                  [styles.copyBtn_feedback]: copyFeedback,
                })}
                onClick={() => {
                  copy(json, { format: 'text/plain' });
                  setCopyFeedback(true);

                  setTimeout(() => {
                    setCopyFeedback(false);
                  }, 2000);
                }}
              >
                {copyFeedback ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>

            <pre className={styles.json}>
              <Highlight code={json} language="json" />
            </pre>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
