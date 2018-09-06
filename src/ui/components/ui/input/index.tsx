import * as React from 'react';
import * as styles from './input.styl';

export class Input extends React.Component {

    props: any;

    el: HTMLInputElement;
    getRef = element => this.el = element;

    focus() {
        this.el.focus();
    }

    blur() {
        this.el.blur();
    }

    render() {
        let { className, error, ...props } = this.props;
        className = !className ? styles.input : `${styles.input} ${className}`;
        className += error ? ` ${styles.error}` : '';
        return <input className={className} {...props} ref={this.getRef}/>
    }
}
