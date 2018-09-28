import * as React from 'react';
import * as styles from './error.styl';
import cn from 'classnames';

export class Error extends React.PureComponent {

    props: IProps;
    state = { showed: false };
    onClick = (e) => this._onClick(e);

    render() {
        const { showed } = this.state;

        const { className = '', type, show, onClick, hideByClick, children, ...props } = this.props;

        if (type === 'modal') {
            return null;
        }

        const errorProps = {
            ...props,
            onClick: this.onClick,
            className: cn(styles.error, className, {
                [styles.modalError]: type && type === 'modal'
            })
        };

        return (
            <div { ...errorProps }>
                {showed ?  children: null}
            </div>
        );
    }

    _onClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e);
            return null;
        }

        if (this.props.hideByClick) {
            this.setState({ hidden: true });
        }
    }

    static getDerivedStateFromProps(props, state) {
        const { showed } = state;
        const { show } = props;

        if (!state || showed != show) {
            return { ...state, showed: show };
        }

        return null;
    }
}

interface IProps {
    type?: string;
    show?: boolean;
    children?: any;
    className?: string;
    hideByClick?: boolean;
    onClick?: (...args) => void;
}
