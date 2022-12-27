import copy from 'copy-to-clipboard';
import { Children, cloneElement, PureComponent } from 'react';

interface Props {
  text: string | null | undefined;
  children: React.ReactNode;
  options: {
    debug?: boolean;
    message?: string;
    format?: string; // MIME type
    onCopy?: (clipboardData: object) => void;
  };
  onCopy: (...args: unknown[]) => unknown;
}

export class Copy extends PureComponent<Props> {
  static defaultProps = {
    onCopy: undefined,
    options: { format: 'text/plain' },
    text: '',
  };

  onClick = (event: {
    stopPropagation: () => void;
    preventDefault: () => void;
  }) => {
    const { text, onCopy, children, options } = this.props;

    event.stopPropagation();
    event.preventDefault();

    const elem = Children.only(children);

    const result = copy(text ?? '', options);

    if (onCopy) {
      onCopy(text, result);
    }

    if (
      elem &&
      (elem as React.ReactElement).props &&
      typeof (elem as React.ReactElement).props.onClick === 'function'
    ) {
      (elem as React.ReactElement).props.onClick(event);
    }
  };

  render() {
    const { text, onCopy, options, children, ...props } = this.props;
    const elem = Children.only(children);

    return cloneElement(elem as React.ReactElement, {
      ...props,
      onClick: this.onClick,
    });
  }
}
