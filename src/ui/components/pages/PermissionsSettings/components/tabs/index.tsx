import clsx from 'clsx';
import { PureComponent } from 'react';

import * as styles from './index.styl';

export class Tabs extends PureComponent<IProps> {
  selectHandler = (name: string) => () => {
    if (this.props.currentTab !== name) {
      this.props.onSelectTab(name);
    }
  };

  render() {
    const className = clsx(styles.tabs, this.props.className);
    const selected = this.props.currentTab;

    return (
      <div className={className}>
        {this.props.tabs.map(({ item, name }, i) => (
          <div
            key={i}
            id={`${name}Tab`}
            onClick={this.selectHandler(name)}
            className={clsx(styles.tab, {
              [styles.selected]: selected === name,
            })}
          >
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }
}

interface IProps extends React.ComponentProps<'div'> {
  tabs: Array<{ item: React.ReactElement | string; name: string }>;
  currentTab: string;
  className?: string;
  onSelectTab: (tab: string) => void;
}
