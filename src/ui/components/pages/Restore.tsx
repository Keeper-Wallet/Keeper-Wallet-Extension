import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';

@translate('restore')
class RestoreComponent extends React.Component {

    render () {
        return <div className={styles.restore}>
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

export const Restore = connect(mapStateToProps)(RestoreComponent);
