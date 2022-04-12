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

        {['ledger', 'wx'].includes(type) && (
          <div className={styles.typeIconContainer}>
            <div className={styles.typeIcon}>
              {type === 'wx' && (
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
              )}

              {type === 'ledger' && (
                <svg width="11" height="11" fill="#fff">
                  <path d="M9.019.575H4.467v6.09h6.109V2.16c.002-.856-.699-1.585-1.557-1.585Zm-5.95 0h-.764c-.858 0-1.592.697-1.592 1.587v.761H3.07V.575ZM.713 4.35H3.07v2.348H.713V4.349Zm7.51 6.09h.764c.858 0 1.591-.698 1.591-1.588v-.758H8.223v2.345ZM4.467 8.092h2.355v2.348H4.467V8.093Zm-3.754 0v.76c0 .856.7 1.588 1.592 1.588h.764V8.093H.713Z" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
