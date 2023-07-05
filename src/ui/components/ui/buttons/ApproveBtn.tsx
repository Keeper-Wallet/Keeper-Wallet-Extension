import { PureComponent } from 'react';

import { Button } from './Button';

interface Props extends React.ComponentProps<'button'> {
  autoClickProtection?: boolean;
  loading?: boolean;
  view?: 'submit';
}

interface State {
  pending?: boolean;
  timerEnd?: number;
}

export class ApproveBtn extends PureComponent<Props, State> {
  readonly state: State = {};

  static getDerivedStateFromProps(
    { autoClickProtection }: Props,
    { timerEnd }: State,
  ): State {
    return {
      pending: autoClickProtection && (!timerEnd || timerEnd > Date.now()),
    };
  }

  componentDidMount(): void {
    const updateInterval = () => {
      const { autoClickProtection } = this.props;

      if (!autoClickProtection) return;

      const currentTime = Date.now();

      const timerEnd = this.state.timerEnd ?? currentTime + 2000;

      this.setState({ timerEnd });

      if (timerEnd >= currentTime) {
        if (this._timeout != null) {
          clearTimeout(this._timeout);
        }

        this._timeout = setTimeout(updateInterval, 100);
      }
    };

    updateInterval();
  }

  _timeout: ReturnType<typeof setTimeout> | undefined;

  render() {
    const { autoClickProtection, disabled, loading, ...otherProps } =
      this.props;

    const { pending } = this.state;

    return (
      <Button
        {...otherProps}
        disabled={disabled || loading || pending}
        loading={loading}
      >
        {!loading && this.props.children}
      </Button>
    );
  }
}
