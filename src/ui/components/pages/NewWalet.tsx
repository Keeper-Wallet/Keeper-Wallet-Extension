import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { setTab } from '../../actions';
import { AvatarList } from '../ui/avatar/AvatarList';
import { Seed } from '@waves/signature-generator';
import { Button } from '../ui/buttons';

@translate('extension.newWallet')
class NewWalletComponent extends React.Component {

    state;
    onSelect = (account) => this._onSelect(account);

    constructor(props) {
        super(props);

        const list = NewWalletComponent.getNewWallets();
        const account = list[0] || {};

        this.state = {
            list,
            account
        };
    }

    static getNewWallets() {
        const list = [];
        for (let i = 0; i < 5; i++) {
            const seedData = Seed.create();
            list.push({ seed: seedData.phrase, address: seedData.address });
        }
        return list ;
    }

    render () {
        return <div className={styles.login}>
            <div>
                <Trans i18nKey='createNew'>
                    Create New Account
                </Trans>
            </div>

            <div>
                <Trans i18nKey='select'>Choose your address avatar</Trans>
                <Trans i18nKey='selectInfo'>This avatar is unique. You cannot change it later.</Trans>
            </div>

            <div>
                <AvatarList size={38} items={this.state.list} selected={this.state.account} onSelect={this.onSelect}/>
            </div>

            <div>
                <Trans i18nkey='address'>Account address</Trans>:
                <div>{this.state.account.address}</div>
            </div>

            <div>
                <Button type="submit">
                    <Trans i18nKey="continue">Continue</Trans>
                </Button>
            </div>
        </div>
    }

    _onSelect(account) {
        this.setState({ account });
    }
}

const actions = {
    setTab
};

const mapStateToProps = function(store: any) {
    return {
        state: store.state
    };
};

export const NewWallet = connect(mapStateToProps, actions)(NewWalletComponent);
