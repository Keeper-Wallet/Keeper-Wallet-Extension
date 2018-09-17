import * as styles from './styles/backupSeed.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {Copy, Button} from '../ui';
import {setTab} from '../../actions';


@translate('backupSeed')
class BackUpSeedComponent extends React.Component {

    props;
    onClick = () => this._onClick();

    render() {
        return <div className={styles.content}>
            <h2 className={`title1 margin2`}>
                <Trans i18nKey='saveBackup'>Save backup phrase</Trans>
            </h2>

            <div className="flex margin-main">
                <div className={`basic500`}>
                    <Trans i18nKey="backupCarefully">
                        Please carefully write down these 15 words or copy them
                    </Trans>
                </div>
                <Copy text={this.props.account.seed} onCopy={this.onCopy}>
                    <div className={`copy-icon ${styles.copyIcon}`}></div>
                </Copy>
            </div>

            <div className="plate center">
                {this.props.account.seed}
            </div>

            <Button type='submit' onClick={this.onClick}>
                <Trans i18nKey='continue'>Continue</Trans>
            </Button>

            <div className={`basic500 tag1 center ${styles.bottomText}`}>
                <Trans i18nKey="confirmBackupInfo">
                    You will confirm this phrase on the next screen
                </Trans>
            </div>
        </div>
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
