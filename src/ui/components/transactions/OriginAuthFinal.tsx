import './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
export class OriginAuthFinal extends React.PureComponent {
    
    readonly props;
    
    componentWillUpdate(props): void {
        const { isApprove, hasNewMessages } = props;
        
        if (isApprove && hasNewMessages) {
            this.props.onNext();
        }
    }

    render() {
        const { isApprove, isReject } = this.props;

        if (isApprove) {
            return <div>
                <div className="margin-main headline2">
                    <Trans i18nKey='sign.authOriginOk'>Allow requests</Trans>
                </div>
            </div>
        }

        if (isReject) {
            return <div className="margin-main-large headline2">
                <Trans i18nKey='sign.authOriginReject'>Blocked requests</Trans>
            </div>
        }

        return null;
    }
}
