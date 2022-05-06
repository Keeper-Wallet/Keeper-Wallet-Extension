import * as React from 'react';
import cn from 'classnames';
import * as styles from './index.styl';

export class Tabs extends React.PureComponent<IProps> {
  selectHandler = name => () => {
    if (this.props.currentTab !== name) {
      this.props.onSelectTab(name);
    }
  };

  render() {
    const className = cn(styles.tabs, this.props.className);
    const selected = this.props.currentTab;

    return (
      <div className={className}>
        {this.props.tabs.map(({ item, name }, i) => (
          <div
            key={i}
            id={`${name}Tab`}
            onClick={this.selectHandler(name)}
            className={cn(styles.tab, { [styles.selected]: selected === name })}
          >
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }
}

interface IProps extends React.ComponentProps<'div'> {
  tabs: Array<{ item: React.ReactElement<any>; name: string }>;
  currentTab: string;
  className?: string;
  onSelectTab: (tab: string) => void;
}
