import * as styles from './styles/confirmBackup.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { Button, Error, Pills } from '../ui';
import { setUiState, user } from '../../actions';
import { WalletTypes } from '../../services/Background';

const SHUFFLE_COUNT = 500;

class ConfirmBackupComponent extends React.Component {
  props;
  state = {
    seed: null,
    list: [],
    selectedList: [],
    wrongSeed: false,
    complete: false,
    disabled: false,
  };

  static getDerivedStateFromProps(props, state) {
    const { seed } = props.account;

    if (seed == state.seed) {
      return null;
    }

    const list = seed
      .split(' ')
      .map((text, id) => ({ text, id, selected: true, hidden: false }));
    let count = SHUFFLE_COUNT;

    while (count--) {
      const index = Math.floor(Math.random() * list.length);
      const item = list.splice(index, 1)[0];
      list.push(item);
    }

    return { ...state, list, seed };
  }

  onSelect = list => this._onSelect(list);

  onUnSelect = list => this._onUnSelect(list);

  onClear = () => this._onClear();

  onSubmit = e => this._onSubmit(e);

  render() {
    const { selectedList, list, complete, wrongSeed } = this.state;
    const showButton = complete && !wrongSeed;
    const showClear = complete && wrongSeed;

    return (
      <div className={styles.content}>
        <h2 className={`title1 margin1`}>
          <Trans i18nKey="confirmBackup.confirmBackup">Confirm backup</Trans>
        </h2>

        <Pills
          className={`${styles.readSeed} plate body3`}
          list={selectedList}
          selected={false}
          onSelect={this.onUnSelect}
        />

        <div className="center body3">
          {complete ? null : (
            <Trans i18nKey="confirmBackup.selectWord">
              Please, tap each word in the correct order
            </Trans>
          )}
          {showClear ? (
            <Error show={true} className={styles.noMargin}>
              <Trans i18nKey="confirmBackup.wrongSeed">
                Wrong order, try again
              </Trans>
            </Error>
          ) : null}
        </div>

        <Pills
          className={styles.writeSeed}
          list={list}
          selected={true}
          onSelect={this.onSelect}
        />
        {showButton ? (
          <Button
            id="confirmBackup"
            type="submit"
            disabled={this.state.disabled}
            className={styles.confirm}
            onClick={this.onSubmit}
          >
            <Trans i18nKey="confirmBackup.confirm">Confirm</Trans>
          </Button>
        ) : null}
        {showClear ? (
          <div className={`center tag1 ${styles.clearSeed}`}>
            <Button type="transparent" onClick={this.onClear}>
              <span className="submit400">
                <Trans i18nKey="confirmBackup.clear">Clear</Trans>{' '}
              </span>
              <Trans i18nKey="confirmBackup.selectAgain"> and tap again</Trans>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  private _onSubmit(event) {
    event.preventDefault();
    this.props.setUiState({
      account: null,
    });
    this.props.addUser(this.props.account, WalletTypes.New);
    this.setState({ disabled: true });
  }

  private _onSelect({ text, id }) {
    const selected = [...this.state.selectedList, { text, id }];
    this._setSelected(selected);
  }

  private _onUnSelect({ id }) {
    const selected = this.state.selectedList.filter(item => item.id !== id);
    this._setSelected(selected);
  }

  private _setSelected(selected) {
    const list = this.state.list;
    const selectedTextsList = selected.map(item => item.text);
    const selectedIdsList = selected.map(item => item.id);

    const state = {
      selectedList: selected,
      wrongSeed: this.state.seed !== selectedTextsList.join(' '),
      complete: selected.length === list.length,
      list: this.state.list.map(item => {
        item.hidden = selectedIdsList.includes(item.id);
        return item;
      }),
    };

    this.setState(state);
  }

  private _onClear() {
    this._setSelected([]);
  }
}

const mapStateToProps = function (store: any) {
  return {
    account: store.localState.newAccount,
    ...store.localState.addNewAccount,
  };
};

export const ConfirmBackup = connect(mapStateToProps, {
  addUser: user,
  setUiState,
})(ConfirmBackupComponent);
