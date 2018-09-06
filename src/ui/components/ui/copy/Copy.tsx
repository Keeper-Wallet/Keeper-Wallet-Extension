import * as React from 'react';
import * as copy from 'copy-to-clipboard';

export class Copy extends React.PureComponent {

    static defaultProps = {
        onCopy: undefined,
        options: undefined,
        text: ''
    };

    props;

    onClick = event => {
        const {
            text,
            onCopy,
            children,
            options
        } = this.props;

        const elem = React.Children.only(children);

        const result = copy(text, options);

        if (onCopy) {
            onCopy(text, result);
        }

        if (elem && elem.props && typeof elem.props.onClick === 'function') {
            elem.props.onClick(event);
        }
    };


    render() {
        const {
            text,
            onCopy,
            options,
            children,
            ...props
        } = this.props;
        const elem = React.Children.only(children);

        return React.cloneElement(elem, {...props, onClick: this.onClick});
    }
}
