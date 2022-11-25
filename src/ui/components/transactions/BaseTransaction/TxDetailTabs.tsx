import { useTranslation } from 'react-i18next';
import {
  PlateCollapsable,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from 'ui/components/ui';
import { Highlight } from 'ui/components/ui/highlight/highlight';
import { useAppSelector } from 'ui/store';

interface Props {
  children?: React.ReactNode;
}

export function TxDetailTabs({ children }: Props) {
  const { t } = useTranslation();
  const json = useAppSelector(state => state.activePopup?.msg?.json);

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
            <PlateCollapsable showExpand showCopy>
              <Highlight code={json} language="json" />
            </PlateCollapsable>
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
}
