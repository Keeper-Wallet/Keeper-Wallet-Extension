import * as styles from './Alias/alias.styl';
import { ShowScript } from '../ui';
import { Tabs } from './Tabs';
import * as React from 'react';

const TransactionJson = ({ message }) => {
    return (
        <div className={styles.txRow}>
            <ShowScript isData={false} script={JSON.stringify(JSON.parse(message.json), null, 2)} showNotify={true} />
        </div>
    );
};

export const TransactionDetails = ({ children }) => {
    return (
        <Tabs>
            <div data-label="transactions.details">{children}</div>
            <div data-label="transactions.json">
                <TransactionJson message={children.props.message} />
            </div>
        </Tabs>
    );
};
