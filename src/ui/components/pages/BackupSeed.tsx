import * as styles from './styles/backupSeed.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { setUiStateAndSetTab, newAccountSelect, setUiState } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { Copy, Button, Modal } from '../ui';
import { PAGES } from '../../pageConfig';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class BackUpSeedComponent extends React.Component {
    readonly state = {} as any;
    readonly props;
    _t;
    onClick = () => this._onClick();
    copyHandler = () => this._onCopy();
    cancelHandler = () => this._cancelHandler();

    render() {
        return <div className={styles.content}>
            <h2 className='title1 margin2'>
                <Trans i18nKey='backupSeed.saveBackup'>Save backup phrase</Trans>
            </h2>

            <div className='flex margin-main'>
                <div className='basic500 tag1'>
                    <Trans i18nKey='backupSeed.backupCarefully'>
                        Please carefully write down these 15 words or copy them
                    </Trans>
                </div>
                <Copy onCopy={this.copyHandler} text={this.props.account.seed} >
                    <div className={`copy-icon ${styles.copyIcon}`}></div>
                </Copy>
            </div>

            <div className={`plate center body3 ${styles.plateMargin}`}>
                {this.props.account.seed}
            </div>

            <div className={`basic500 tag1 margin1 center ${styles.bottomText}`}>
                <Trans i18nKey='backupSeed.confirmBackupInfo'>
                    You will confirm this phrase on the next screen
                </Trans>
            </div>

            <Button className="submit margin-main-big" type='submit' onClick={this.onClick}>
                <Trans i18nKey='backupSeed.continue'>Continue</Trans>
            </Button>

            <Button className="button default" onClick={this.cancelHandler}>
                <Trans i18nKey='backupSeed.cancel'>Cancel creation</Trans>
            </Button>

            <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={this.state.showCopied} showChildrenOnly={true}>
                <div className="modal notification">
                    <Trans i18nKey="backupSeed.copied">Copied!</Trans>
                </div>
            </Modal>
        </div>
    }

    componentDidMount() {
        this.props.setUiState({
            account: this.props.account,
        });
    }

    _onCopy() {
        this.setState({ showCopied: true });
        clearTimeout(this._t);
        this._t = setTimeout(() => this.setState({ showCopied: false }), 1000);
    }

    _onClick() {
        this.props.setTab(PAGES.CONFIRM_BACKUP);
    }

    _cancelHandler() {
        this.props.setUiStateAndSetTab({
            account: null,
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
    setUiStateAndSetTab,
    newAccountSelect
};

export const BackUpSeed = connect(mapStateToProps, actions)(BackUpSeedComponent);
