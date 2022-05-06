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
    const { pending } = this.state;
    const { disabled, loading, ...restProps } = this.props;

    const progressProps = {
      percent: this.state.percentage,
      strokeWidth: 4,
      className: styles.approveProgress,
      colors: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
      trackLineColor: 'rgba(255, 255, 255, 0.33)',
      size: 30,
      lineCap: 'round',
    };

    return (
      <Button
        {...restProps}
        disabled={disabled || loading || pending}
        loading={loading}
        className={cn(restProps.className, styles.hideText, styles.svgWrapper)}
      >
        {!loading && this.props.children}
        {pending && <CircularProgressbar {...progressProps} />}
      </Button>
    );
  }

  _updateInterval(currentTime) {
    if (!this.props.autoClickProtection) {
      return null;
    }
    const timerEnd =
      this.state.timerEnd || currentTime + CONFIG.MESSAGES_CONFIRM_TIMEOUT;
    this.setState({ timerEnd, currentTime });
    if (timerEnd >= currentTime) {
      clearTimeout(this._timeout);
      this._timeout = window.setTimeout(this.updateInterval, 100);
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { timerEnd, currentTime } = state;
    const autoClickProtection = props.autoClickProtection;
    const pending =
      autoClickProtection && (!timerEnd || timerEnd > currentTime);
    const percentage = !timerEnd
      ? 0
      : 100 -
        Math.floor(
          ((timerEnd - currentTime) / CONFIG.MESSAGES_CONFIRM_TIMEOUT) * 100
        );
    return { ...props, pending, timerEnd, percentage };
  }
}
