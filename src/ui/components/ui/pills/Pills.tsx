import * as React from 'react';
import { Pill } from './Pill';
import * as styles from './pills.styl';
import cn from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export class Pills extends React.PureComponent {
    props;
    onSelect = (item) => this._onSelect(item);

    render() {
        const { className, onSelect, animated, list, ...props } = this.props;
        const myClassName = cn(styles.pills, className);
        return (
            <div className={myClassName}>
                <TransitionGroup>
                    {list.map((item) => (
                        <CSSTransition classNames="animated" timeout={200}>
                            <Pill
                                onSelect={this.onSelect.bind(null, item)}
                                text={item.text}
                                hidden={item.hidden}
                                selected={item.selected}
                                key={item.id}
                                {...props}
                            />
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </div>
        );
    }

    private _onSelect(item) {
        if (this.props.onSelect) {
            this.props.onSelect(item);
        }
    }
}
