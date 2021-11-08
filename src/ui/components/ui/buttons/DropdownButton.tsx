import * as React from 'react';
import cn from 'classnames';
import * as styles from './dropdownButton.styl';
import { Button } from './Button';

export class DropdownButton extends React.PureComponent<IProps, IState> {
  private element: HTMLDivElement;

  getRef = element => (this.element = element);

  clickHandler = () => {
    const showList = this.state.showList;

    if (!showList) {
      this.setClickOut();
    } else {
      this.removeClickOut();
    }

    this.setState({ showList: !this.state.showList });
  };

  clickOutHandler = e => {
    let el = e.target;

    while (el) {
      if (el === this.element) {
        return null;
      }

      el = el.parentElement;
    }

    this.clickHandler();
  };

  componentWillUnmount(): void {
    this.removeClickOut();
  }

  setClickOut = () => {
    document.addEventListener('click', this.clickOutHandler, { capture: true });
  };

  removeClickOut = () => {
    document.removeEventListener('click', this.clickOutHandler, {
      capture: true,
    });
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      showList: false,
    };
  }

  render(): React.ReactNode {
    const [defaultItem, ...otherItems] = this.props.children;

    return (
      <div
        className={cn(
          styles.splitButton,
          this.props.className,
          'buttons-group'
        )}
        ref={this.getRef}
      >
        <div className={'relative flex'}>
          {defaultItem}

          <div className={cn(styles.arrowButton)}>
            <Button
              type={defaultItem.props.type}
              onClick={this.clickHandler}
              className={cn(styles.dropdownButton)}
            />
          </div>
        </div>

        {this.state.showList ? (
          <div className={styles.list}>
            {otherItems.map(item => (
              <div className={styles.listItem}>{item}</div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
}

interface IProps extends React.ComponentProps<'div'> {
  children?: any;
}

interface IState {
  showList: boolean;
}
