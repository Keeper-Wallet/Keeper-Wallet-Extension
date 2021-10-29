import { Highlight, PlateCollapsable, Tab, TabList, TabPanel, TabPanels, Tabs } from '../../ui';
import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './txdetailtabs.styl';
import cn from 'classnames';

const PrettyJSON = ({ data }) => {
    return <Highlight className={cn('json', 'body3', styles.code)}>{data}</Highlight>;
};

export function TxDetailTabs({ children }) {
    const prettyJson = JSON.stringify(JSON.parse(children.props.message.json), null, 2);

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
                        <PrettyJSON data={prettyJson} />
                    </PlateCollapsable>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
