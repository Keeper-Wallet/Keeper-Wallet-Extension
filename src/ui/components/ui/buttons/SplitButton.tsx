import * as React from "react";
import cn from 'classnames';
import * as styles from './splitButton.styl';
import { Button } from "./Button";

export class SplitButton extends React.PureComponent<IProps, IState> {
    private element: HTMLDivElement;

    getRef = (element) => this.element = element;

    selectHandler = (item: TDropdownItem) => {
    };

    clickHandler = () => {
        const showList = this.state.showList;

        if (!showList) {
            this.setClickOut();
        } else {
            this.removeClickOut();
        }

        this.setState({ showList: !this.state.showList });
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
        document.addEventListener('click', this.clickOutHandler);
    };

    removeClickOut = () => {
        document.removeEventListener('click', this.clickOutHandler);
    };

    constructor(props: IProps) {
        super(props);

        this.state = {
            showList: false,
        };
    }

    render(): React.ReactNode {
        return (
            <div className={cn(styles.splitButton, this.props.className, 'buttons-group')} ref={this.getRef}>
                <div className={'relative flex'}>
                    <Button type={this.props.type}>
                        {this.props.children}
                    </Button>

                    <div className={cn(styles.arrowButton)}>
                        <Button type={this.props.type} onClick={this.clickHandler}
                                className={cn(styles.dropdownButton)}/>
                    </div>
                </div>

                <List isShow={this.state.showList} list={this.props.dropdownList} onClickItem={this.selectHandler} />
            </div>
        )
    }
}

const List = ({ list, onClickItem, isShow }) => {
    return !isShow ? null : <div className={styles.list}>
        {
            list.map(item => (
                <div key={item.id} className={styles.listItem} onClick={(e) => onClickItem(item)}>{item.text}</div>
            ))
        }
    </div>
};

type TText = string|React.ReactNode;

type TDropdownItem = {
    id: string|number;
    text: TText;
};

interface IProps extends React.ComponentProps<'div'> {
    type: string;
    dropdownList: Array<TDropdownItem>;
    children?: any
    onClickBtn?: () => void;
    onClickDropdownItem?: (id: string|number) => void;
}

interface IState {
    showList: boolean;
}
