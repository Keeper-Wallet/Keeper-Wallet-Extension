import * as React from 'react';
import * as styles from './error.styl';

export class Error extends React.PureComponent {

    props: IProps;
    state = { hidden: false };
    onClick = this._onClick;

    render() {
        const { hidden } = this.state;

        if (hidden) {
            return null;
        }

        const { className = '', children, ...props } = this.props;
        const errorProps = {
            ...props,
            onClick: this.onClick,
            className: `${styles.error} ${className}`
        };

        return (
            <div { ...errorProps }>
                {children}
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
    hide?: boolean;
    children?: any;
    className?: string;
    hideByClick?: boolean;
    onClick?: (...args) => void;

}
