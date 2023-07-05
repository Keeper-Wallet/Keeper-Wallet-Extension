import clsx from 'clsx';
import * as avatar from 'identity-img';
import { type PreferencesAccount } from 'preferences/types';
import { Component } from 'react';

import * as styles from './avatar.styl';

const SIZE = 67;

interface Props {
  address: string | null;
  className?: string;
  size: number;
  type?: PreferencesAccount['type'];
}

interface State {
  address?: string | null;
  src?: string;
}

export class Avatar extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
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
      <div className={clsx(styles.avatar, className)} style={style}>
        <img src={src} width={size} height={size} style={style} />

        {['ledger', 'wx', 'debug'].includes(type) && (
          <div className={styles.typeIconContainer}>
            <div className={styles.typeIcon}>
              {type === 'wx' ? (
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
              ) : type === 'ledger' ? (
                <svg width="11" height="11" fill="#fff">
                  <path d="M9.019.575H4.467v6.09h6.109V2.16c.002-.856-.699-1.585-1.557-1.585Zm-5.95 0h-.764c-.858 0-1.592.697-1.592 1.587v.761H3.07V.575ZM.713 4.35H3.07v2.348H.713V4.349Zm7.51 6.09h.764c.858 0 1.591-.698 1.591-1.588v-.758H8.223v2.345ZM4.467 8.092h2.355v2.348H4.467V8.093Zm-3.754 0v.76c0 .856.7 1.588 1.592 1.588h.764V8.093H.713Z" />
                </svg>
              ) : type === 'debug' ? (
                <svg width="20" height="20" viewBox="0 0 48 48" fill="#fff">
                  <path d="M24 42Q20.85 42 18.275 40.225Q15.7 38.45 14.1 35.65L9.1 38.5L7.6 35.95L12.85 32.9Q12.6 32.05 12.4 31.2Q12.2 30.35 12.1 29.5H6V26.5H12.1Q12.2 25.65 12.4 24.8Q12.6 23.95 12.85 23.1L7.6 20L9.1 17.45L14.05 20.35Q14.5 19.55 15.05 18.875Q15.6 18.2 16.2 17.55Q16.1 17.15 16.05 16.775Q16 16.4 16 16Q16 14.6 16.525 13.275Q17.05 11.95 18 10.9L14.7 7.65L16.8 5.5L20.35 9Q21.2 8.5 22.1 8.25Q23 8 24 8Q25 8 25.9 8.25Q26.8 8.5 27.65 9L31.2 5.5L33.3 7.65L30 10.95Q30.9 12 31.425 13.3Q31.95 14.6 31.95 16Q31.95 16.4 31.925 16.75Q31.9 17.1 31.8 17.5Q32.4 18.15 32.925 18.825Q33.45 19.5 33.9 20.3L38.9 17.5L40.4 20.05L35.15 23.05Q35.45 23.9 35.625 24.75Q35.8 25.6 35.9 26.5H42V29.5H35.9Q35.8 30.35 35.625 31.225Q35.45 32.1 35.15 32.95L40.4 36L38.9 38.55L33.9 35.65Q32.3 38.45 29.725 40.225Q27.15 42 24 42ZM19.05 15.3Q20.2 14.65 21.45 14.325Q22.7 14 24 14Q25.3 14 26.525 14.325Q27.75 14.65 28.9 15.25Q28.6 13.6 27.15 12.3Q25.7 11 24 11Q22.3 11 20.825 12.3Q19.35 13.6 19.05 15.3ZM24 39Q27.85 39 30.425 35.55Q33 32.1 33 28Q33 24.25 30.575 20.625Q28.15 17 24 17Q19.85 17 17.425 20.625Q15 24.25 15 28Q15 32.1 17.575 35.55Q20.15 39 24 39ZM22.5 34V22H25.5V34Z" />
                </svg>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  }
}
