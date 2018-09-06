import * as React from 'react';
import { Pill } from './Pill';
import * as styles from './pills.styl';
import cn from 'classnames';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export class Pills extends React.PureComponent {

    props;
    onSelect = item => this._onSelect(item);

    render() {
        const {className, onSelect, animated, list, ...props} = this.props;
        const myClassName = cn(styles.pills, className);
        return <div className={myClassName}>
            <CSSTransitionGroup transitionName="animated"
                                transitionEnterTimeout={200}
                                transitionEnter={animated}
                                transitionLeaveTimeout={200}
                                transitionLeave={animated}
            >{
                list.map(item => <Pill onSelect={this.onSelect.bind(null, item)}
                                       text={item.text}
                                       hidden={item.hidden}
                                       selected={item.selected}
                                       key={item.id}
                                       {...props}
                />)}
            </CSSTransitionGroup>
        </div>;
    }

    private _onSelect(item) {
        if (this.props.onSelect) {
            this.props.onSelect(item);
        }
    }
}
