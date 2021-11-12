import * as React from 'react';
import * as styles from './input.styl';
import cn from 'classnames';

export class Input extends React.Component {
  props: any;

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
    let { className, error, multiLine, inputRef, ...props } = this.props;

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
