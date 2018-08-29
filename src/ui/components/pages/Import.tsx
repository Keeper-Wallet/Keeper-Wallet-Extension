import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';

@translate('confirm')
class ConfirmComponent extends React.Component {

    render () {
        return <div className={styles.login}>
            <Trans>
                Confirm page
            </Trans>
        </div>
    }
}

const mapStateToProps = function(store: any) {
    return {
        state: store.state
    };
};

export const Confirm = connect(mapStateToProps)(ConfirmComponent);
