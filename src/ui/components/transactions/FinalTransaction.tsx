import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import cn from 'classnames';

const Error = ({ approveError }) => {
    return <div>ERROR {approveError}</div>;
};

@translate('extension')
export class FinalTransaction extends React.PureComponent {
    readonly props;
    
    render() {
        const { transactionStatus } = this.props;
        const isApprove = !!transactionStatus.approveOk;
        const isReject = !!transactionStatus.rejectOk;
        const isError = !!transactionStatus.approveError;
        const className = cn(styles.txFinalIcon, 'margin-main', {
            'tx-error-icon': isError,
            'tx-approve-icon': isReject || isApprove,
        });
        return <div className={`${styles.txFinal} center`}>
            <div className={className}></div>
            <div className="headline2 margin-main">
                {isApprove ? <Trans i18nKey='sign.approved'>Your transaction is approved!</Trans> : null}
                {isReject ? <Trans i18nKey='sign.rejected'>Your transaction is rejected!</Trans> : null}
                {isError ? <Error approveError={transactionStatus.approveError}/> : null}
            </div>
            {/*<div className="link">*/}
                {/*<Trans i18nKey='sign.viewTransaction'>View transaction</Trans>*/}
            {/*</div>*/}
            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.props.onClick}>
                <Trans i18nKey='sign.ok'>Okay</Trans>
            </Button>
        </div>;
    }
}