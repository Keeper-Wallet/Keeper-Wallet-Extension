import * as styles from './styles/backupSeed.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Copy, Button } from '../ui';
import { setTab } from '../../actions';


@translate('backupSeed')
class BackUpSeedComponent extends React.Component {

    props;
    onCopy = (result) => this._onCopy(result);
    onClick = () => this._onClick();

    render () {
        return <div className={styles.backUp}>
            <div className={styles.content}>
                <h2>
                    <Trans i18nKey="saveBackup">
                        Save backup phrase
                    </Trans>
                </h2>

                <div>
                    <div>
                        <Trans i18nKey="backupCarefully">
                            Please carefully write down these 15 words  or copy them
                        </Trans>
                    </div>
                    <Copy text={this.props.account.seed} onCopy={this.onCopy}>
                        <div>Copy</div>
                    </Copy>
                </div>
                <div style={styles.seed}>
                    {this.props.account.seed}
                </div>
                <div>
                    <Button type='submit' onClick={this.onClick}>
                        <Trans i18nKey='continue'>Continue</Trans>
                    </Button>
                    <Trans i18nKey="confirmBackupInfo">
                        You will confirm this phrase on the next screen
                    </Trans>
                </div>
            </div>
        </div>
    }

    _onCopy(result?) {
        //oncopy
    }

    _onClick() {
        this.props.setTab('confirmBackup');
    }
}

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.newAccount
    };
};

const actions = {
    setTab
};

export const BackUpSeed = connect(mapStateToProps, actions)(BackUpSeedComponent);
