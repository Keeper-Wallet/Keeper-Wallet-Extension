import * as styles from './styles/newaccountname.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { setTab, newAccountName } from '../../actions';
import { Input, Button } from '../ui';

@translate('newAccountName')
class NewWalletNameComponent extends React.Component {

    inputEl: Input;
    props;

    passwordError: boolean;
    onChange = (e) => this._onChange(e);
    onSubmit = () => this._onSubmit();
    getRef = input => this.inputEl = input;

    render () {
        return <div className={styles.newAccountName}>
            <Trans i18nKey="title">
                Account name
            </Trans>

            <div className={styles.content}>
                <form onSubmit={this.onSubmit}>
                    <div>
                        <Input ref={this.getRef}
                               onChange={this.onChange}
                        />
                    </div>

                    <Trans i18nKey="nameInfo">
                        The account name will be known only to you
                    </Trans>

                    <div>
                        <Button type='submit'>
                            <Trans i18nKey="continue">Continue</Trans>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    }

    _onChange(e) {
        this.props.newAccountName(e.target.value)
    }

    _onSubmit() {
        if (this.props.account.type === 'seed') {
            this.props.setTab('safeBackup');
        } else {
            this.props.setTab('assets');
        }
    }
}

const mapStateToProps = function(store: any) {
    return {
        account: store.localState.newAccount
    };
};

const actions = {
    setTab,
    newAccountName
};

export const NewWalletName = connect(mapStateToProps, actions)(NewWalletNameComponent);
