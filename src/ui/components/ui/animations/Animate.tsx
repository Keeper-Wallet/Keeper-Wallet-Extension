import './styles/animations.styl';
import * as React from 'react';
import { CSSTransition } from 'react-transition-group';

export const ANIMATIONS = {
    SLIDE_LEFT: 'slid-left',
    SLIDE_RIGHT: 'slid-right',
    SLIDE_UP: 'slid-up',
    SLIDE_DOWN: 'slid-down',
    FADE_IN: 'fade-in',
    FADE_OUT: 'fade-out',
};

export const Animation = (props) => {
    const { animation = null, children = null, className = '', time = 600 } = props;

    return (
        <CSSTransition
            className={className}
            classNames={animation}
            timeout={time}
            enter={!!animation}
            exit={!!animation}
        >
            {children}
        </CSSTransition>
    );
};
