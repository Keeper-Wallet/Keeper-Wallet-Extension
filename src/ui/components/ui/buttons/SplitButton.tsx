import * as React from "react";
import cn from 'classnames';
import * as styles from './splitButton.styl';
import { Button } from "./Button";

export class SplitButton<T> extends React.PureComponent<IProps<T>, IState<T>> {
    private element: HTMLDivElement;

    getRef = (element) => this.element = element;

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
        document.addEventListener('click', this.clickOutHandler);
    };

    removeClickOut = () => {
        document.removeEventListener('click', this.clickOutHandler);
    };

    constructor(props: IProps<T>) {
        super(props);

        this.state = {
            showList: false,
        };
    }

    render(): React.ReactNode {
        return (
            <div className={cn(styles.splitButton, this.props.className, 'buttons-group')} ref={this.getRef}>
                <Button type={this.props.type}>
                    {this.props.children}
                </Button>

                <div className={cn(styles.arrowButton)}>
                    <Button type={this.props.type} onClick={this.clickHandler} className={cn(styles.dropdownButton)} />
                </div>
            </div>
        )
    }
}

type TText = string|React.ReactNode;

type TDropdownItem<T> = {
    id: string|number;
    text: TText;
    value: T;
};

interface IProps<T> extends React.ComponentProps<'div'> {
    type: string;
    dropdownList?: Array<TDropdownItem<T>>;
    children?: any
    description?: TText;
    onClickBtn?: () => void;
    onClickDropdownItem?: (id: string|number) => void;
}

interface IState<T> {
    showList: boolean;
}
