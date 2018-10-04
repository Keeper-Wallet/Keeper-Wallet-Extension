import * as React from 'react';
import { Trans, translate } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import {connect} from 'react-redux';
import { clearMessagesStatus, clearMessages } from '../../actions';
import { PAGES } from '../../pageConfig';

@translate('extension')
class SelectTxAccountComponent extends React.PureComponent {
    
    readonly props;
    onClick = () => {
        this.props.clearMessagesStatus();
        this.props.clearMessages();
        this.props.setTab(PAGES.ASSETS);
    };
    
    render() {
        return <div>
            <h2>
                <Trans i18nKey='sign.changeAccount'>Do you want to change your account?</Trans>
            </h2>
            <h4>
                <Trans i18nKey='sign.changeAccountInfo'>If you change account, we will cancel the current transaction.
                    After selecting a new active account, repeat the operation.</Trans>
            </h4>

            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.onClick}>
                <Trans i18nKey='sign.switchAccount'>Switch account</Trans>
            </Button>
        </div>;
    }
}

export const SelectTxAccount = connect(null, { clearMessagesStatus, clearMessages })(SelectTxAccountComponent);
