import * as styles from './styles/confirmBackup.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {Button, Error, Pills} from '../ui';
import {user, setUiState} from '../../actions';

const SHUFFLE_COUNT = 500;

@translate('extension')
class ConfirmBackupComponent extends React.Component {

    props;
    state = {seed: null, list: [], selectedList: [], wrongSeed: false, complete: false};
    onSelect = (list) => this._onSelect(list);
    onUnSelect = (list) => this._onUnSelect(list);
    onClear = () => this._onClear();
    onSubmit = () => this._onSubmit();

    render() {
        const {selectedList, list, complete, wrongSeed} = this.state;
        const showButton = complete && !wrongSeed;
        const showClear = complete && wrongSeed;

        return <div className={styles.content}>
            <h2 className={`title1 margin1`}>
                <Trans i18nKey='confirmBackup.confirmBackup'>Confirm backup</Trans>
            </h2>

            <Pills animated={true}
                   className={`${styles.readSeed} plate`}
                   list={selectedList}
                   selected={false}
                   onSelect={this.onUnSelect}/>

            <div className="center">
                {complete ? null : <Trans i18nKey='confirmBackup.selectWord'>
                    Please, tap each word in the correct order
                </Trans>}
                {showClear ? (
                    <Error className={styles.noMargin}>
                        <Trans i18nKey="confirmBackup.wrongSeed">Wrong order, try again</Trans>
                    </Error>
                ) : null}
            </div>

            <Pills className={styles.writeSeed}
                   list={list} selected={true} onSelect={this.onSelect}/>
            {showButton ?
                <Button type='submit'
                        className={styles.confirm}
                        onClick={this.onSubmit}>
                    <Trans i18nKey='confirmBackup.confirm'>Confirm</Trans>
                </Button>
                : null}
            {showClear ? (
                <div className={`center tag1 ${styles.clearSeed}`}>
                    <Button type='transparent' onClick={this.onClear}>
                        <span className="submit400"><Trans i18nKey='confirmBackup.clear'>Clear</Trans></span>
                        <Trans i18nKey='confirmBackup.selectAgain'> and tap again</Trans>
                    </Button>
                </div>
            ) : null}
        </div>
    }

    private _onSubmit() {
        this.props.setUiState({
            account: null
        });
        this.props.addUser(this.props.account);
    }

    private _onSelect({text, id}) {
        const selected = [...this.state.selectedList, {text, id}];
        this._setSelected(selected);
    }

    private _onUnSelect({text}) {
        const selected = this.state.selectedList.filter(item => item.text !== text);
        this._setSelected(selected);
    }

    private _setSelected(selected) {
        const list = this.state.list;
        const selectedTextsList = selected.map(item => item.text);

        const state = {
            selectedList: selected,
            wrongSeed: this.state.seed !== selectedTextsList.join(' '),
            complete: selected.length === list.length,
            list: this.state.list.map(item => {
                item.hidden = selectedTextsList.includes(item.text);
                return item;
            })
        };

        this.setState(state);
    }

    private _onClear() {
        this._setSelected([]);
    }

    static getDerivedStateFromProps(props, state) {
        const {seed} = props.account;

        if (seed == state.seed) {
            return null;
        }

        const list = seed.split(' ').map((text, id) => ({text, id, selected: true, hidden: false}));
        let count = SHUFFLE_COUNT;

        while (count--) {
            const index = Math.floor(Math.random() * list.length);
            const item = list.splice(index, 1)[0];
            list.push(item);
        }

        return {...state, list, seed};
    }
}

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.newAccount,
        ...store.localState.addNewAccount
    };
};

export const ConfirmBackup = connect(mapStateToProps, {addUser: user, setUiState})(ConfirmBackupComponent);
