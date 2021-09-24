import * as styles from './styles/newaccountname.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { newAccountName, setUiState, user } from '../../actions';
import { Button, Error, Input } from '../ui';
import { CONFIG } from '../../appConfig';

class NewWalletNameComponent extends React.Component {
    inputEl: Input;
    readonly props;
    readonly state = { disabled: false, errors: [] } as any;

    passwordError: boolean;

    constructor(params) {
        super(params);
        this.props.setUiState({
            account: null,
        });
    }

    static validateName(name: string, accounts) {
        const errors = [];
        const names = accounts.map(({ name }) => name);

        if (name.length < CONFIG.NAME_MIN_LENGTH) {
            errors.push({ code: 1, key: 'newAccountName.errorRequired', msg: 'Required name' });
        }

        if (names.includes(name)) {
            errors.push({ code: 2, key: 'newAccountName.errorInUse', msg: 'Name already exist' });
        }

        return errors;
    }

    static getDerivedStateFromProps(props, state) {
        const { account, accounts, accountSave } = props;
        const name = (account && account.name) || '';
        const errors = NewWalletNameComponent.validateName(name, accounts);
        let error = state.error;
        if (accountSave && accountSave.error) {
            errors.push({
                code: 3,
                key: 'newAccountName.errorSeedExist',
                msg: 'Account already exist',
            });
            error = true;
        }
        return { ...state, errors, error };
    }

    onChange = (e) => this._onChange(e);

    onSubmit = (e) => this._onSubmit(e);

    onBlur = () => this._onBlur();

    getRef = (input) => (this.inputEl = input);

    render() {
        return (
            <div className={styles.content}>
                <h2 className={`title1 margin1`}>
                    <Trans i18nKey="newAccountName.accountName">Account name</Trans>
                </h2>

                <form onSubmit={this.onSubmit}>
                    <div className={`margin1`}>
                        <Input
                            ref={this.getRef}
                            className="margin1"
                            onChange={this.onChange}
                            value={this.props.account.name || ''}
                            maxLength="32"
                            autoFocus={true}
                            error={this.state.error}
                            onBlur={this.onBlur}
                        />
                        <Error show={this.state.error} errors={this.state.errors} />
                    </div>

                    <div className={`basic500 tag1 margin2`}>
                        <Trans i18nKey="newAccountName.nameInfo">The account name will be known only to you</Trans>
                    </div>

                    <div className={styles.buttons}>
                        {this.props.account.hasBackup ? (
                            <Button
                                type="submit"
                                onClick={this._onSave}
                                disabled={this.state.errors.length || this.state.disabled}
                            >
                                <Trans i18nKey="newAccountName.continue">Continue</Trans>
                            </Button>
                        ) : (
                            <Button type="submit" disabled={this.state.errors.length}>
                                <Trans i18nKey="newAccountName.continueBackup">Create backup</Trans>
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    componentDidMount() {
        //this.inputEl.focus();
    }

    _onChange(e) {
        const newName = e.target.value;
        this.props.newAccountName(newName);
    }

    _onBlur() {
        const errors = NewWalletNameComponent.validateName(this.props.account.name, this.props.accounts);
        this.setState({ error: errors.length, errors });
    }

    _onSave = (e) => {
        e.preventDefault();
        this.props.addUser(this.props.account);
        this.setState({ disabled: true });
    };

    _onSubmit(e) {
        e.preventDefault();

        if (this.props.account.hasBackup) {
            this.props.addUser(this.props.account);
            return null;
        }

        this.props.setTab(this.props.next);
    }
}

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.newAccount,
        accountSave: store.localState.addNewAccount,
        accounts: store.accounts,
        addUser: user,
    };
};

const actions = {
    newAccountName,
    addUser: user,
    setUiState,
};

export const NewWalletName = connect(mapStateToProps, actions)(NewWalletNameComponent);
