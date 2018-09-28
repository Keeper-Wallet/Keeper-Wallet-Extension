import * as styles from './styles/importSeed.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Seed } from '@waves/signature-generator';
import { newAccountSelect } from '../../actions';
import { Button } from '../ui/buttons';
import { Input } from '../ui/input';
import { PAGES } from '../../pageConfig';

@translate('extension')
class ImportSeedComponent extends React.Component {
    props;
    state;
    inputEl: Input;
    getRef = input => this.inputEl = input;
    onSubmit = () => this._onSubmit();
    onChange = e => this._changeHandler(e);
    inputBlurHandler = () => this._showError(true);
    inputFocusHandler = () => this._showError(false);

    constructor({ isNew, ...props }) {
        super(props);
        const value = isNew ? '' : this.props.account && this.props.account.phrase;
        const error = this._validate(value, true);
        this.state = { value, error, showError: false };
    }

    componentDidMount(){
        this.inputEl.focus();
    }
    
    render () {
        const address = !this.state.error ? this.props.account.address : '';

        return <div className={styles.content}>
            <div>
                <h2 className={'title1 margin3 left'}>
                    <Trans i18nKey='importSeed.importSeed'>Welcome Back</Trans>
                </h2>
            </div>

            <form onSubmit={this.onSubmit}>
                <div className={'tag1 basic500 input-title'}>
                    <Trans i18nkey='importSeed.newSeed'>Wallet Seed</Trans>:
                </div>

                <Input error={this.state.error && this.state.showError}
                    ref={this.getRef}
                    onChange={this.onChange}
                    onBlur={this.inputBlurHandler}
                    onFocus={this.inputFocusHandler}
                    multiLine={true}
                    value={this.state.value}
                    className="margin5"
                    placeholder={
                        this.props.t('importSeed.inputSeed', 'Your seed is the 15 words you saved when creating your account')
                    }/>


                <div className={'tag1 basic500 input-title'}>
                    <Trans i18nkey='importSeed.address'>Account address</Trans>:
                </div>

                <div className={`${styles.greyLine} grey-line`}>{address}</div>

                <Button type="submit" disabled={this.state.error}>
                    <Trans i18nKey='importSeed.importAccount'>Import Account</Trans>
                </Button>
            </form>
        </div>
    }

    _onSubmit() {
        this.props.setTab(PAGES.ACCOUNT_NAME_SEED);
    }

    _validate(value = '', noSetState?) {
        const error = value.length < 15;
        if (!noSetState) {
            this.setState({ error });
        }
        return error;
    }

    _changeHandler(e) {
        const phrase = e.target.value;
        let seed = { address: '', phrase: '' };

        if (phrase.length >= 15) {
            seed = new Seed(phrase);
        }

        this.setState({ value: phrase });
        this._validate(phrase);
        this.props.newAccountSelect({ ...seed, seed: seed.phrase, type: 'seed', name: '', hasBackup: true});
    }

    _showError(isShow) {
        this.setState({ showError: isShow });
    }
}

const actions = {
    newAccountSelect,
};

const mapStateToProps = function(store: any) {
    return {
        account: store.localState.newAccount
    };
};

export const ImportSeed = connect(mapStateToProps, actions)(ImportSeedComponent);
