import * as React from 'react';
import * as copy from 'copy-to-clipboard';

interface Props {
  text: string;
  children: React.ReactNode;
  options: {
    debug?: boolean;
    message?: string;
    format?: string; // MIME type
    onCopy?: (clipboardData: object) => void;
  };
  onCopy: (...args: unknown[]) => unknown;
}

export class Copy extends React.PureComponent<Props> {
  static defaultProps = {
    onCopy: undefined,
    options: { format: 'text/plain' },
    text: '',
  };

  props;

  onClick = event => {
    const { text, onCopy, children, options } = this.props;

    event.stopPropagation();
    event.preventDefault();

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
    const { children, ...props } = this.props;
    const elem = React.Children.only(children);

    return React.cloneElement(elem, { ...props, onClick: this.onClick });
  }
}
