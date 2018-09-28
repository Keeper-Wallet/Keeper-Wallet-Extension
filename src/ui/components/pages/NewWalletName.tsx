import * as styles from './styles/newaccountname.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {newAccountName, user, setUiState} from '../../actions';
import {Input, Button, Error} from '../ui';

@translate('extension')
class NewWalletNameComponent extends React.Component {

    inputEl: Input;
    readonly props;
    readonly state = {} as any;

    passwordError: boolean;
    onChange = (e) => this._onChange(e);
    onSubmit = (e) => this._onSubmit(e);
    onBlur = () => this._onBlur();
    getRef = input => this.inputEl = input;

    constructor(params) {
        super(params);
        this.props.setUiState({
            account: null
        });
    }

    render() {
        return <div className={styles.content}>
            <h2 className={`title1 margin1`}>
                <Trans i18nKey='newAccountName.accountName'>Account name</Trans>
            </h2>

            <form onSubmit={this.onSubmit}>
                <div className={`margin1`}>
                    <Input ref={this.getRef}
                           className="margin1"
                           onChange={this.onChange}
                           value={this.props.account.name || ''}
                           maxLength='32'
                           error={this.state.noName}
                           onBlur={this.onBlur}/>
                    <Error show={this.state.noName}>
                        <Trans i18nKey='newAccountName.errorNameRequired'>Name is required</Trans>
                    </Error>
                </div>

                <div className={`basic500 tag1 margin2`}>
                    <Trans i18nKey="newAccountName.nameInfo">
                        The account name will be known only to you
                    </Trans>
                </div>

                <Button type='submit' disabled={!this.props.account.name}>
                    <Trans i18nKey="newAccountName.continue">Continue</Trans>
                </Button>
            </form>

        </div>
    }

    componentDidMount() {
        this.inputEl.focus();
    }

    _onChange(e) {
        this.props.newAccountName(e.target.value);
        if (e.target.value) {
            this.setState({noName: false});
        }

    }

    _onBlur() {
        this.setState({noName: !this.props.account.name});
    }

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
        account: store.localState.newAccount
    };
};

const actions = {
    newAccountName,
    addUser: user,
    setUiState,
};

export const NewWalletName = connect(mapStateToProps, actions)(NewWalletNameComponent);
