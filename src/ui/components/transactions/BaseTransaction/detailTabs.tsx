import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { CheckIcon } from 'icons/check';
import { CopyIcon } from 'icons/copy';
import { usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'ui/components/ui';
import { Highlight } from 'ui/components/ui/highlight/highlight';

import * as styles from './detailTabs.module.css';

interface Props {
  children?: React.ReactNode;
}

export function TxDetailTabs({ children }: Props) {
  const { t } = useTranslation();
  const json = usePopupSelector(state => state.activePopup?.msg?.json);
  const [copyFeedback, setCopyFeedback] = useState(false);

  return (
    <Tabs>
      <TabList className="body3">
        <Tab>{t('transactions.details')}</Tab>
        {json && <Tab>{t('transactions.json')}</Tab>}
      </TabList>

      <TabPanels>
        <TabPanel>{children}</TabPanel>

        {json && (
          <TabPanel>
            <div className={styles.root}>
              <div className={styles.inner}>
                <Highlight code={json} language="json" />

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
            </div>
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
}
