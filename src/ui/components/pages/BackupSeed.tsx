import * as styles from './styles/backupSeed.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { setUiStateAndSetTab, setUiState } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { Copy, Button } from '../ui';
import { PAGES } from '../../pageConfig';

@translate('extension')
class BackUpSeedComponent extends React.Component {

    props;
    onClick = () => this._onClick();
    cancelHandler = () => this._cancelHandler();

    render() {
        return <div className={styles.content}>
            <h2 className='title1 margin2'>
                <Trans i18nKey='backupSeed.saveBackup'>Save backup phrase</Trans>
            </h2>

            <div className='flex margin-main'>
                <div className='basic500'>
                    <Trans i18nKey='backupSeed.backupCarefully'>
                        Please carefully write down these 15 words or copy them
                    </Trans>
                </div>
                <Copy text={this.props.account.seed}>
                    <div className={`copy-icon ${styles.copyIcon}`}></div>
                </Copy>
            </div>

            <div className='plate center'>
                {this.props.account.seed}
            </div>

            <div className={`basic500 tag1 center ${styles.bottomText}`}>
                <Trans i18nKey='backupSeed.confirmBackupInfo'>
                    You will confirm this phrase on the next screen
                </Trans>
            </div>

            <Button type='submit' onClick={this.onClick}>
                <Trans i18nKey='backupSeed.continue'>Continue</Trans>
            </Button>

            <Button onClick={this.cancelHandler}>
                <Trans i18nKey='backupSeed.cancel'>Cancel creation</Trans>
            </Button>
        </div>
    }

    componentDidMount() {
        this.props.setUiState({
            account: this.props.account
        });
    }

    _onClick() {
        this.props.setTab(PAGES.CONFIRM_BACKUP);
    }

    _cancelHandler() {
        this.props.setUiStateAndSetTab({
            account: null
        }, PAGES.ROOT);
    }
}

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.newAccount,
        ui: store.uiState
    };
};

const actions = {
    setUiState,
    setUiStateAndSetTab
};

export const BackUpSeed = connect(mapStateToProps, actions)(BackUpSeedComponent);
