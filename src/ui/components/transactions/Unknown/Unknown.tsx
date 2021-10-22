import * as styles from './unknown.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';

import { UnknownCard } from './UnknownCard';
import { UnknownInfo } from './UnknownInfo';
import { ApproveBtn, Button, BUTTON_TYPE } from '../../ui';
import { TransactionHeader } from '../TransactionHeader';

export const Unknown = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.unknownTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <UnknownCard {...props} />
                </div>

                <UnknownInfo message={message} assets={assets} />
            </div>

            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button onClick={props.reject} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey="sign.reject" />
                </Button>
                <ApproveBtn onClick={props.approve} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey="sign.auth" />
                </ApproveBtn>
            </div>
        </div>
    );
};
