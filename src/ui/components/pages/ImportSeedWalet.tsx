import * as styles from './styles/importSeed.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { setTab } from '../../actions';
import { Seed } from '@waves/signature-generator';
import { Button } from '../ui/buttons';
import { Input } from '../ui/input';

@translate('extension importSeed')
class ImportSeedComponent extends React.Component {
    props;
    state;
    onSubmit = () => this._onSubmit();

    render () {
        return <div className={styles.content}>
            <div>
                <h2 className={'title1 margin3 left'}>
                    <Trans i18nKey='importSeed'>Welcome Back</Trans>
                </h2>
            </div>

            <form onSubmit={this.onSubmit}>
                <div className={'tag1 basic500'}>
                    <Trans i18nkey='newSeed'>New Wallet Seed</Trans>:
                </div>

                <Input multiLine={true} value={this.props.account.seed} placeholder={this.props.t('inputSeed', 'Your seed is the 15 words you saved when creating your account')}/>

                
                <div className={'tag1 basic500'}>
                    <Trans i18nkey='address'>Account address</Trans>:
                </div>

                <div className={`${styles.greyLine} grey-line`}>{this.props.account.address}</div>

                <Button type="submit">
                    <Trans i18nKey="importAccount">Import Account</Trans>
                </Button>
            </form>
        </div>
    }

    _onSubmit() {
        this.props.setTab('accountName');
    }
}

const actions = {
    setTab,
};

const mapStateToProps = function(store: any) {
    return {
        account: store.localState.newAccount
    };
};

export const ImportSeed = connect(mapStateToProps, actions)(ImportSeedComponent);
