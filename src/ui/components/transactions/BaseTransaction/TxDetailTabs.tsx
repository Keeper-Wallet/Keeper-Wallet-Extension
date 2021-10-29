import * as styles from '../Alias/alias.styl';
import { ShowScript, Tab, TabList, TabPanel, TabPanels, Tabs } from '../../ui';
import * as React from 'react';
import { Trans } from 'react-i18next';

const TransactionJson = ({ message }) => {
    return (
        <div className={styles.txRow}>
            <ShowScript isData={false} script={JSON.stringify(JSON.parse(message.json), null, 2)} showNotify={true} />
        </div>
    );
};

export function TxDetailTabs({ children }) {
    return (
        <Tabs>
            <TabList>
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
                    <TransactionJson message={children.props.message} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
