import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './auth.styl';

export class AuthInfo extends React.PureComponent<IAuthInfo> {
    render() {
        const { message } = this.props;
        const { messageHash } = message;

        return (
            <div>
                <div className={`${styles.txRow} ${styles.borderedBottom} margin-main-big `}>
                    <div className="tx-title body3 basic500">
                        <Trans i18nKey="transactions.dataHash" />
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>

                <div className={`${styles.infoBlock} info-block body3 basic500 left`}>
                    <div>
                        <i className="inactive-account-icon" />
                    </div>
                    <div>
                        <Trans i18nKey="sign.signAccessInfo" />
                    </div>
                </div>
            </div>
        );
    }
}

interface IAuthInfo {
    message: any;
    assets: any;
}
