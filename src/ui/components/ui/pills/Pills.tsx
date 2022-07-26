import * as React from 'react';
import { Pill } from './Pill';
import * as styles from './pills.styl';
import cn from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export interface PillsListItem {
  id: number;
  text: string;
  selected?: boolean;
  hidden?: boolean;
}

interface Props {
  className?: string;
  id?: number;
  selected?: boolean;
  list: PillsListItem[];
  onSelect: (item: PillsListItem) => void;
}

export class Pills extends React.PureComponent<Props> {
  onSelect = (item: PillsListItem) => this._onSelect(item);

  render() {
    const { className, onSelect, list, ...props } = this.props;
    const myClassName = cn(styles.pills, className);
    return (
      <TransitionGroup className={myClassName}>
        {list.map(item => (
          <CSSTransition key={item.id} classNames="animated" timeout={200}>
            <Pill
              onSelect={this.onSelect.bind(null, item)}
              text={item.text}
              hidden={item.hidden}
              selected={item.selected}
              key={item.id}
              {...props}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    );
  }

  private _onSelect(item: PillsListItem) {
    if (this.props.onSelect) {
      this.props.onSelect(item);
    }
  }
}
