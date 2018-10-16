import './styles/animations.styl';
import * as React from 'react';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cn from 'classnames';

export const ANIMATIONS = {
    SLIDE_LEFT: 'slid-left',
    SLIDE_RIGHT: 'slid-right',
    SLIDE_UP: 'slid-up',
    SLIDE_DOWN: 'slid-down',
    FADE_IN: 'fade-in',
    FADE_OUT: 'fade-out',
};

export const Animation = (props) => {
    const { animation = null , children = null, className = '', time = 600 } = props;

    return <CSSTransitionGroup className={className}
                               transitionName={animation}
                               transitionEnterTimeout={time}
                               transitionEnter={!!animation}
                               transitionLeaveTimeout={time}
                               transitionLeave={!!animation}>
        {children}
    </CSSTransitionGroup>;
};
