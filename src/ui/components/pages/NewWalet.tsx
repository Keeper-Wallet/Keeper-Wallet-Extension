import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { setTab } from '../../actions';

@translate('newWallet')
class NewWalletComponent extends React.Component {

    render () {
        return <div className={styles.login}>
            <Trans i18nKey='createNew'>
                Create New Account
            </Trans>
        </div>
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
