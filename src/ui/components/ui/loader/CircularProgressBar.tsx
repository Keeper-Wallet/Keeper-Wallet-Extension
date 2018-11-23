import * as React from 'react';
import 'rc-progress/assets/index.css';
import { Circle } from 'rc-progress';

export const CircularProgressbar = (props: IProps) => {
    return <Circle {...props}/>
};

interface IProps {
    percent: number;
    className?: string;
    strokeWidth?: number;
    strokeLinecap?: string;
    strokeColor?: string;
    trailWidth?: number;
    trailColor?: string;
    style?: Object;
    gapDegree?: number;
    gapPosition?: string;
}
