import * as React from 'react';
import * as styles from './error.styl';
import cn from 'classnames';

export class Error extends React.PureComponent {

    props: IProps;
    state = { hidden: false };
    onClick = (e) => this._onClick(e);

    render() {
        const { hidden } = this.state;

        const { className = '', type, hide, onClick, hideByClick, children, ...props } = this.props;

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
                {hidden ? null : children}
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
        const { hidden } = state;
        const { hide } = props;

        if (!state || hidden !== hide) {
            return { ...state, hidden: hide };
        }

        return null;
    }
}

interface IProps {
    type?: string;
    hide?: boolean;
    children?: any;
    className?: string;
    hideByClick?: boolean;
    onClick?: (...args) => void;
}
