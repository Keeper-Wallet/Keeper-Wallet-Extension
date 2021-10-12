import * as React from 'react';
import cn from 'classnames';
import * as styles from './index.styl';

export class Select<T> extends React.PureComponent<IProps<T>, IState<T>> {
    private element: HTMLDivElement;

    getRef = (element) => (this.element = element);

    selectHandler = (item: TSelectItem<T>) => {
        this.setState({ showList: false, value: item.value, id: item.id });
        this.props.onSelectItem(item.id);
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

    clickOutHandler = (e) => {
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
        document.removeEventListener('click', this.clickOutHandler, { capture: true });
    };

    constructor(props: IProps<T>) {
        super(props);

        const { selected, selectList = [] } = props;
        const selectedEl = selectList.find(({ id }) => id === selected) || selectList[0];
        this.state = {
            ...selectedEl,
            showList: false,
        };
    }

    render(): React.ReactNode {
        const selected = this.props.selected == null ? this.state.id : this.props.selected;
        const { text } = this.props.selectList.find(({ id }) => id === selected);

        return (
            <div className={cn(styles.select, this.props.className)} ref={this.getRef}>
                <Title text={this.props.description} />
                <div className={styles.selectInput} onClick={this.clickHandler}>
                    {text}
                </div>
                <List
                    isShow={this.state.showList}
                    list={this.props.selectList.filter(({ id }) => id !== selected)}
                    onSelect={this.selectHandler}
                />
            </div>
        );
    }
}

const Title = ({ text }) => (text ? <div className="left input-title basic500 tag1">{text}</div> : null);

const List = ({ list, onSelect, isShow }) => {
    return !isShow ? null : (
        <div className={styles.list}>
            {list.map((item) => (
                <div key={item.id} className={styles.listItem} onClick={(e) => onSelect(item)}>
                    {item.text}
                </div>
            ))}
        </div>
    );
};

type TText = string | React.ReactNode;

type TSelectItem<T> = {
    id: string | number;
    text: TText;
    value: T;
};

interface IProps<T> extends React.ComponentProps<'div'> {
    selectList: Array<TSelectItem<T>>;
    description?: TText;
    selected?: string | number;
    onSelectItem?: (id: string | number) => void;
}

interface IState<T> {
    value: T;
    id: string | number;
    showList: boolean;
}
