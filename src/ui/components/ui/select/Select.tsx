import * as React from 'react';
import cn from 'classnames';
import * as styles from './index.styl';

export class Select<T> extends React.PureComponent<IProps<T>, IState<T>> {
  private element: HTMLDivElement;

  getRef = element => {
    this.props.forwardRef && (this.props.forwardRef.current = element);
    this.element = element;
  };

  selectHandler = (item: TSelectItem<T>) => {
    this.setState({ showList: false });
    this.props.onSelectItem(item.id, item.value);
    this.removeClickOut();
  };

  clickHandler = () => {
    const showList = this.state.showList;

    if (!showList) {
      this.setClickOut();
    } else {
      this.removeClickOut();
    }

    this.setState({ showList: !showList });
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

  constructor(props: IProps<T>) {
    super(props);

    this.state = {
      showList: false,
    };
  }

  render(): React.ReactNode {
    const {
      selected,
      selectList = [],
      className,
      description,
      onSelectItem,
      forwardRef,
      ...restProps
    } = this.props;

    const { text } =
      selectList.find(({ id }) => id === selected) || selectList[0];

    return (
      <div className={cn(styles.select, className)} ref={this.getRef}>
        <Title text={description} />
        <div
          className={cn(styles.selectInput, 'cant-select')}
          onClick={this.clickHandler}
          {...restProps}
        >
          <div className={styles.listItemSelected}>{text}</div>
        </div>
        <List
          isShow={this.state.showList}
          list={selectList.filter(({ id }) => id !== selected)}
          onSelect={this.selectHandler}
        />
      </div>
    );
  }
}

const Title = ({ text }) =>
  text ? <div className="left input-title basic500 tag1">{text}</div> : null;

const List = ({ list, onSelect, isShow }) => {
  return (
    isShow && (
      <div className={cn(styles.list, 'cant-select')}>
        {list.map(item => (
          <div
            key={item.id}
            className={styles.listItem}
            onClick={() => onSelect(item)}
          >
            {item.text}
          </div>
        ))}
      </div>
    )
  );
};

type TText = string | React.ReactNode;

type TSelectItem<T> = {
  id: string | number;
  text: TText;
  value: T;
};

interface IProps<T> {
  className?: string;
  forwardRef?: React.MutableRefObject<HTMLDivElement>;
  selectList: Array<TSelectItem<T>>;
  description?: TText;
  selected?: string | number;
  onSelectItem?: (id: string | number, value: T) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface IState<T> {
  showList: boolean;
}
