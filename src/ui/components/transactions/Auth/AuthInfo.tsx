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
                        <Trans i18nKey="transactions.dataHash">Data Hash</Trans>
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>

                <div className={`${styles.infoBlock} info-block body3 basic500 left`}>
                    <div>
                        <i className="inactive-account-icon" />
                    </div>
                    <div>
                        <Trans i18nKey="sign.signAccessInfo">
                            The application will have access to your Waves address but will not expose your SEED or
                            private key. Never enter your secret phrase (SEED) on any website you are redirected to.
                        </Trans>
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
