import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Highlight,
  PlateCollapsable,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from 'ui/components/ui';
import { useAppSelector } from 'ui/store';
import * as styles from './txdetailtabs.styl';

interface Props {
  children?: React.ReactNode;
}

export function TxDetailTabs({ children }: Props) {
  const { t } = useTranslation();
  const message = useAppSelector(state => state.activePopup?.msg);

  return (
    <Tabs>
      <TabList className="body3">
        <Tab>{t('transactions.details')}</Tab>
        <Tab>{t('transactions.json')}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>{children}</TabPanel>
        <TabPanel>
          <PlateCollapsable showExpand showCopy>
            <Highlight
              className={cn('json', 'body3', styles.code)}
              data={message.json}
            />
          </PlateCollapsable>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
