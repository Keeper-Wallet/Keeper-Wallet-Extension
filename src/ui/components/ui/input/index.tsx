import * as React from 'react';
import * as styles from './input.styl';
import cn from 'classnames';

interface Props {
  inputRef?: React.MutableRefObject<HTMLInputElement>;
  className?: string;
  error?: boolean;
  multiLine?: boolean;
}

export class Input extends React.Component<Props> {
  props;

  el: HTMLInputElement;
  getRef = element => {
    this.el = element;
    if (this.props.inputRef) {
      this.props.inputRef.current = element;
    }
  };

  focus() {
    this.el.focus();
  }

  blur() {
    this.el.blur();
  }

  render() {
    let { className, error, multiLine, ...props } = this.props;

    className = cn(styles.input, className, {
      [styles.error]: error,
      [styles.checkbox]: props.type === 'checkbox',
    });
    return multiLine ? (
      <textarea className={className} {...props} ref={this.getRef} />
    ) : (
      <input className={className} {...props} ref={this.getRef} />
    );
  }
}
