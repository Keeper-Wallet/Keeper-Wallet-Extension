import { type AccountsState } from 'accounts/store/types';
import { Component } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { type NewAccountState } from 'store/reducers/localState';
import { type WithNavigate, withNavigate } from 'ui/router';

import { Button, ErrorMessage, Pills, type PillsListItem } from '../ui';
import * as styles from './styles/confirmBackup.styl';

const SHUFFLE_COUNT = 500;

interface StateProps {
  account: Extract<NewAccountState, { type: 'seed' }>;
}

type Props = WithTranslation & StateProps & WithNavigate;

interface State {
  seed: string | null;
  list: PillsListItem[];
  selectedList: PillsListItem[];
  wrongSeed: boolean;
  complete: boolean;
  disabled: boolean;
}

class ConfirmBackupComponent extends Component<Props, State> {
  state: State = {
    seed: null,
    list: [],
    selectedList: [],
    wrongSeed: false,
    complete: false,
    disabled: false,
  };

  static getDerivedStateFromProps(
    props: Readonly<Props>,
    state: State,
  ): Partial<State> | null {
    const { seed } = props.account;

    if (seed === state.seed) {
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

  onSelect = (list: PillsListItem) => this._onSelect(list);

  onUnSelect = (list: PillsListItem) => this._onUnSelect(list);

  onClear = () => this._onClear();

  onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => this._onSubmit(e);

  render() {
    const { t } = this.props;
    const { selectedList, list, complete, wrongSeed } = this.state;
    const showButton = complete && !wrongSeed;
    const showClear = complete && wrongSeed;

    return (
      <div className={styles.content}>
        <h2 className="title1 margin1">{t('confirmBackup.confirmBackup')}</h2>

        <Pills
          className={`${styles.readSeed} plate body3`}
          list={selectedList}
          selected={false}
          onSelect={this.onUnSelect}
        />

        <div className="center body3">
          {complete ? null : t('confirmBackup.selectWord')}
          {showClear ? (
            <ErrorMessage show className={styles.noMargin}>
              {t('confirmBackup.wrongSeed')}
            </ErrorMessage>
          ) : null}
        </div>

        <Pills
          className={styles.writeSeed}
          list={list}
          selected
          onSelect={this.onSelect}
        />
        {showButton ? (
          <Button
            id="confirmBackup"
            type="submit"
            view="submit"
            disabled={this.state.disabled}
            className={styles.confirm}
            onClick={this.onSubmit}
          >
            {t('confirmBackup.confirm')}
          </Button>
        ) : null}
        {showClear ? (
          <div className={`center tag1 ${styles.clearSeed}`}>
            <Button type="button" view="transparent" onClick={this.onClear}>
              <span className="submit400">{t('confirmBackup.clear')} </span>
              {t('confirmBackup.selectAgain')}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  private _onSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    this.setState({ disabled: true });
    this.props.navigate('/account-name', { replace: true });
  }

  private _onSelect({ text, id }: PillsListItem) {
    const selected = [...this.state.selectedList, { text, id }];
    this._setSelected(selected);
  }

  private _onUnSelect({ id }: PillsListItem) {
    const selected = this.state.selectedList.filter(item => item.id !== id);
    this._setSelected(selected);
  }

  private _setSelected(selected: PillsListItem[]) {
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

const mapStateToProps = (state: AccountsState): StateProps => {
  return {
    account: state.localState.newAccount as Extract<
      NewAccountState,
      { type: 'seed' }
    >,
  };
};

export const ConfirmBackup = connect(mapStateToProps)(
  withTranslation()(withNavigate(ConfirmBackupComponent)),
);
