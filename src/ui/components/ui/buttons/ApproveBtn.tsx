import * as React from 'react';
import * as styles from './buttons.styl';
import { Button } from './Button';
import { CONFIG } from '../../../appConfig';

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
        return <Button {...props}>
            {this.props.children}
            {disabled ? <span>{this.state.time}</span> : null}
        </Button>;
    }
    
    _updateInterval(currentTime) {
        const { timerEnd } = this.state;
        this.setState({ currentTime });
        
        if (timerEnd > currentTime) {
            clearTimeout(this._timeout);
            this._timeout = window.setTimeout(this.updateInterval, 500);
        }
    }
    
    static getDerivedStateFromProps(props, state) {
        const { timerEnd = Date.now() + CONFIG.MESSAGES_CONFIRM_TIMEOUT, currentTime = Date.now() } = state;
        const disabled = timerEnd >= currentTime;
        const time = Math.floor((timerEnd - currentTime) / 1000) + 1;
        return { ...props, disabled, time, timerEnd };
    }
}
