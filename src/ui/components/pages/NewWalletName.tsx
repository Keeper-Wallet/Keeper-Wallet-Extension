import * as styles from './styles/newaccountname.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { newAccountName, user } from '../../actions';
import { Input, Button } from '../ui';

@translate('extension')
class NewWalletNameComponent extends React.Component {

    inputEl: Input;
    props;

    passwordError: boolean;
    onChange = (e) => this._onChange(e);
    onSubmit = () => this._onSubmit();
    getRef = input => this.inputEl = input;

    render() {
        return <div className={styles.content}>
            <h2 className={`title1 margin1`}>
                <Trans i18nKey='newAccountName.accountName'>Account name</Trans>
            </h2>

                <form onSubmit={this.onSubmit}>
                    <div className={`margin2`}>
                        <Input ref={this.getRef}
                               onChange={this.onChange}
                               value={this.props.account.name || ''}
                               maxlength='32'
                        />
                    </div>

                    <div className={`basic500 tag1 margin2`}>
                        <Trans i18nKey="newAccountName.nameInfo">
                            The account name will be known only to you
                        </Trans>
                    </div>

                        <Button type='submit'>
                            <Trans i18nKey="newAccountName.continue">Continue</Trans>
                        </Button>
                </form>

        </div>
    }

    _onChange(e) {
        this.props.newAccountName(e.target.value)
    }

    _onSubmit() {
        if (this.props.account.hasBackup) {
            this.props.addUser(this.props.account);
            return null;
        }

        this.props.setTab(this.props.next);
    }
}

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.newAccount
    };
};

const actions = {
    newAccountName,
    addUser: user,
};

export const NewWalletName = connect(mapStateToProps, actions)(NewWalletNameComponent);
