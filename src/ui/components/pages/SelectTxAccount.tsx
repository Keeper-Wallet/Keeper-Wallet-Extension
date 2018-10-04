import * as React from 'react';
import { Trans, translate } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';

@translate('extension')
export class SelectTxAccount extends React.PureComponent {
    
    readonly props;
    
    render() {
        return <div>
            <h2>
                <Trans i18nKey='sign.changeAccount'>Do you want to change your account?</Trans>
            </h2>
            <h4>
                <Trans i18nKey='sign.changeAccountInfo'>If you change account, we will cancel the current transaction.
                    After selecting a new active account, repeat the operation.</Trans>
            </h4>

            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.props.onClick}>
                <Trans i18nKey='sign.switchAccount'>Switch account</Trans>
            </Button>
        </div>;
    }
}
