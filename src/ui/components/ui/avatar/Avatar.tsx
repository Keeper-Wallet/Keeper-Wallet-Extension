import { AccountType } from 'accounts/types';
import cn from 'classnames';
import * as avatar from 'identity-img';
import * as React from 'react';
import * as styles from './avatar.styl';

const SIZE = 67;

interface Props {
  address: string;
  className?: string;
  size: number;
  type?: AccountType;
}

interface State {
  address?: string;
  src?: string;
}

export class Avatar extends React.Component<Props, State> {
  state: State = {};
  props: Props;

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): State | null {
    const { address, size = SIZE } = nextProps;

    if (prevState.address !== address) {
      avatar.config({ rows: 8, cells: 8 });
      const src = address ? avatar.create(address, { size: size * 3 }) : '';
      return { address, src };
    }

    return {};
  }

  render() {
    const { className, size = SIZE, type = 'seed' } = this.props;
    const { src } = this.state;

    const style = {
      width: size,
      height: size,
    };

    return (
      <div className={cn(styles.avatar, className)} style={style}>
        <img src={src} width={size} height={size} style={style} />

        {type == 'wx' && (
          <div className={styles.typeIconContainer}>
            <div className={styles.typeIcon}>
              <svg width="14" height="14" viewBox="0 0 24 18">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 12L20 20H4L12 12Z"
                  fill="#5A81EA"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 12L20 4H4L12 12Z"
                  fill="#E14B51"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }
}
