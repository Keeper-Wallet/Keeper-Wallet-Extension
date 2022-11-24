import cn from 'classnames';
import { PureComponent } from 'react';

import { CONFIG } from '../../../appConfig';
import * as styles from './approveButtons.styl';
import { Button } from './Button';

interface State {
  pending?: boolean;
  timerEnd?: number;
  currentTime?: number;
  percentage?: number;
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  view?: 'submit';
  disabled?: boolean;
  loading?: boolean;
  autoClickProtection?: boolean;
}

export class ApproveBtn extends PureComponent<Props, State> {
  readonly state: State = {};

  updateInterval = () => this._updateInterval(Date.now());
  _timeout: ReturnType<typeof setTimeout> | undefined;

  componentDidMount(): void {
    this.updateInterval();
  }

  render() {
    const { pending } = this.state;
    const { autoClickProtection, disabled, loading, ...restProps } = this.props;

    return (
      <Button
        {...restProps}
        disabled={disabled || loading || pending}
        loading={loading}
        className={cn(restProps.className, styles.hideText, styles.svgWrapper)}
      >
        {!loading && this.props.children}
      </Button>
    );
  }

  _updateInterval(currentTime: number) {
    if (!this.props.autoClickProtection) {
      return null;
    }
    const timerEnd =
      this.state.timerEnd || currentTime + CONFIG.MESSAGES_CONFIRM_TIMEOUT;
    this.setState({ timerEnd, currentTime });
    if (timerEnd >= currentTime) {
      if (this._timeout != null) {
        clearTimeout(this._timeout);
      }

      this._timeout = setTimeout(this.updateInterval, 100);
    }
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State
  ): Partial<State> | null {
    const { timerEnd, currentTime } = state;
    const autoClickProtection = props.autoClickProtection;
    const pending =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      autoClickProtection && (!timerEnd || timerEnd > currentTime!);
    const percentage = !timerEnd
      ? 0
      : 100 -
        Math.floor(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ((timerEnd - currentTime!) / CONFIG.MESSAGES_CONFIRM_TIMEOUT) * 100
        );
    return { ...props, pending, timerEnd, percentage };
  }
}
