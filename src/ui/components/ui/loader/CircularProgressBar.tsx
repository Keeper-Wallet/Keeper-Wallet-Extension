import * as React from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { default as ProgressBar } from 'react-circular-progressbar';

export const CircularProgressbar = (props: IProps) => {
    return <ProgressBar {...props}/>
};

interface IProps {
    percentage: number;
    className?: string;
    text?: string;
    strokeWidth?: number;
    background?: string;
    backgroundPadding?: number;
    initialAnimation?: number;
    counterClockwise?: boolean;
    styles?: Object;
}
