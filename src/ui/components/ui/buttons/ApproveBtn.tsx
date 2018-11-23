import * as React from 'react';
import * as styles from './approveButtons.styl';
import { CircularProgressbar } from '../loader';
import { Button } from './Button';
import { CONFIG } from '../../../appConfig';
import cn from 'classnames';

export class ApproveBtn extends React.PureComponent {
    readonly props;
    readonly state = {} as any;
    updateInterval = () => this._updateInterval(Date.now());
    _timeout;

    constructor(props) {
        super(props);
    }

    componentDidMount(): void {
        this.updateInterval();
    }

    render() {
        const { disabled } = this.state;
        const props = { ...this.props, disabled };
    
    
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
    
    
        const progressProps = {
            percent: this.state.percentage,
            strokeWidth: 4,
            className: styles.approveProgress,
            colors: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
            trackLineColor: 'rgba(255, 255, 255, 0.33)',
            size: 30,
            lineCap: 'round',
        };
        return <Button {...props} className={cn(props.className, styles.hideText, styles.svgWrapper)}>
            {this.props.children}
            {disabled ? <CircularProgressbar {...progressProps}/> : null}
        </Button>;
    }

    _updateInterval(currentTime) {
        const timerEnd = this.state.timerEnd || currentTime + CONFIG.MESSAGES_CONFIRM_TIMEOUT;
        this.setState({ timerEnd, currentTime });
        if (timerEnd >= currentTime) {
            clearTimeout(this._timeout);
            this._timeout = window.setTimeout(this.updateInterval, 100);
        }
    }

    static getDerivedStateFromProps(props, state) {
        const { timerEnd, currentTime } = state;
        const disabled = !timerEnd || timerEnd > currentTime;
        const percentage = !timerEnd ? 0 : 100 - Math.floor((timerEnd - currentTime) / CONFIG.MESSAGES_CONFIRM_TIMEOUT * 100);
        return { ...props, disabled, timerEnd, percentage };
    }
}
