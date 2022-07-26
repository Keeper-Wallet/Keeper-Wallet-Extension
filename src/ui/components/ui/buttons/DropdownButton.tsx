import * as React from 'react';
import cn from 'classnames';
import * as styles from './dropdownButton.styl';
import { Button } from './Button';

interface Props extends React.ComponentProps<'div'> {
  children?: React.ReactElement[];
  placement?: 'top' | 'bottom';
}

interface State {
  showList: boolean;
}

export class DropdownButton extends React.PureComponent<Props, State> {
  private element: HTMLDivElement | null | undefined;

  getRef = (element: HTMLDivElement | null) => (this.element = element);

  clickHandler = () => {
    const showList = this.state.showList;

    if (!showList) {
      this.setClickOut();
    } else {
      this.removeClickOut();
    }

    this.setState({ showList: !this.state.showList });
  };

  clickOutHandler = (e: MouseEvent) => {
    let el = e.target as Node | null;

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

  constructor(props: Props) {
    super(props);

    this.state = {
      showList: false,
    };
  }

  render() {
    const { children, placement = 'bottom', className } = this.props;
    const [defaultItem, ...otherItems] = children as React.ReactElement[];

    return (
      <div
        className={cn(styles.splitButton, className, 'buttons-group')}
        ref={this.getRef}
      >
        <div className={'relative flex'}>
          {defaultItem}

          <div className={cn(styles.arrowButton)}>
            <Button
              type="button"
              view={defaultItem.props.view}
              onClick={this.clickHandler}
              className={cn(styles.dropdownButton)}
            />
          </div>
        </div>

        {this.state.showList && (
          <div
            className={cn(
              styles.list,
              placement === 'top' && styles.listPlacementTop
            )}
          >
            {otherItems.map((item, index) => (
              <div key={index} className={styles.listItem}>
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
