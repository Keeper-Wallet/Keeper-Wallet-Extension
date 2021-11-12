import {
  Highlight,
  PlateCollapsable,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '../../ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import * as styles from './txdetailtabs.styl';
import cn from 'classnames';

interface Props {
  message: any;
  children?: React.ReactNode;
}

export const TxDetailTabs = connect(
  (store: any) => ({ message: store.activePopup?.msg }),
  null
)(function TxDetailTabs({ message, children }: Props) {
  return (
    <Tabs>
      <TabList className="body3">
        <Tab>
          <Trans i18nKey="transactions.details" />
        </Tab>
        <Tab>
          <Trans i18nKey="transactions.json" />
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>{children}</TabPanel>
        <TabPanel>
          <PlateCollapsable showExpand showCopy>
            <Highlight
              className={cn('json', 'body3', styles.code)}
              data={JSON.stringify(JSON.parse(message.json), null, 2)}
            />
          </PlateCollapsable>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
});
