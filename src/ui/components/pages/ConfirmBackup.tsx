import * as styles from './styles/confirmBackup.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {Pills} from '../ui';

const SHUFFLE_COUNT = 500;

@translate('confirmBackup')
class ConfirmBackupComponent extends React.Component {

    props;
    state = {seed: null, list: [], selectedList: [], wrongSeed: false, complete: false};
    onSelect = (list) => this._onSelect(list);
    onUnSelect = (list) => this._onUnSelect(list);

    render() {
        const {selectedList, list, complete, wrongSeed} = this.state;
        const showButton = complete && !wrongSeed;

        return <div className={styles.content}>
            <h2 className={`title1 margin2`}>
                <Trans i18nKey='confirmBackup'>Confirm backup</Trans>
            </h2>

            <Pills animated={true}
                   className={`${styles.readSeed} plate`}
                   list={selectedList}
                   selected={false}
                   onSelect={this.onUnSelect}/>
            <div>
                <Trans i18nKey='selectWord'>
                    Please, tap each word in the correct order
                </Trans>
            </div>
            <Pills className={styles.writeSeed}
                   list={list} selected={true} onSelect={this.onSelect}/>
            {complete && wrongSeed}
        </div>
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
            wrongSeed: this.state.seed !== selectedTextsList.join(),
            complete: selected.length === list.length,
            list: this.state.list.map(item => {
                item.hidden = selectedTextsList.includes(item.text);
                return item;
            })
        };

        this.setState(state);
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
        account: store.localState.newAccount
    };
};

export const ConfirmBackup = connect(mapStateToProps)(ConfirmBackupComponent);
