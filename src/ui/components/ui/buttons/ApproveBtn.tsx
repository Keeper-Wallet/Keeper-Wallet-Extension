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
        const progressProps = {
            percentage: this.state.percentage,
            strokeWidth: 14,
            className: styles.approveProgress,
            counterClockwise:false,
            styles: {
            path: {
                stroke: '#fff',
            },
            trail: { stroke: 'rgba(255, 255, 255, 0.33)' },
            }
        };

        return <Button {...props} className={cn(props.className, styles.hideText, styles.svgWrapper)}>
            {this.props.children}
            {disabled ? <CircularProgressbar {...progressProps}/> : null}
        </Button>;
    }

    _updateInterval(currentTime) {
        const { timerEnd } = this.state;
        this.setState({ currentTime });

        if (timerEnd > currentTime) {
            clearTimeout(this._timeout);
            this._timeout = window.setTimeout(this.updateInterval, 100);
        }
    }

    static getDerivedStateFromProps(props, state) {
        const { timerEnd = Date.now() + CONFIG.MESSAGES_CONFIRM_TIMEOUT, currentTime = Date.now() } = state;
        const disabled = true//timerEnd == currentTime;
        const time = Math.floor((timerEnd - currentTime) / 1000) + 1;
        const percentage = 100 -Math.floor((timerEnd - currentTime) / 100);
        return { ...props, disabled, time, timerEnd, percentage };
    }
}
