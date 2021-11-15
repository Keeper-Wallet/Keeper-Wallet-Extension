import * as React from 'react';
import * as styles from './assets.styl';
import cn from 'classnames';
import ColorHash from 'color-hash';

const Scripted = (
  <svg viewBox="0 0 10 10" className={styles.assetSubIconSvg}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.178 3.447a.617.617 0 0 1 .844-.9l2.133 2c.26.243.26.656 0 .9l-2.133 2a.617.617 0 0 1-.844-.9l1.654-1.55-1.654-1.55zm-4.01 1.55l1.654 1.55a.617.617 0 0 1-.844.9l-2.133-2a.617.617 0 0 1 0-.9l2.133-2a.617.617 0 0 1 .844.9l-1.654 1.55z"
    />
  </svg>
);

const Sponsored = (
  <svg viewBox="0 0 10 10" className={styles.assetSubIconSvg}>
    <path
      fill="currentColor"
      d="M7.649 2.351a.714.714 0 0 1 0 1.012L3.363 7.649A.715.715 0 0 1 2.35 6.637l4.286-4.286a.714.714 0 0 1 1.012 0zm-5.22 1.506a1.429 1.429 0 1 1 0-2.857 1.429 1.429 0 0 1 0 2.857zM7.57 9a1.429 1.429 0 1 1 0-2.857 1.429 1.429 0 0 1 0 2.857z"
    />
  </svg>
);

interface Props extends React.HTMLProps<HTMLImageElement> {
  assetId: string;
  name: string;
  logo?: string;
  hasScript?: boolean;
  hasSponsorship?: boolean;
}

export function AssetLogo({
  className,
  assetId,
  logo,
  name,
  hasSponsorship,
  hasScript,
}: Props) {
  const style = {
    backgroundColor: new ColorHash().hex(assetId),
  };
  if (!logo) {
    return (
      <div className={cn(styles.assetLogo, className)} style={style}>
        <div>{name && name[0].toUpperCase()}</div>
        {(hasSponsorship || hasScript) && (
          <div className={styles.assetSubIconContainer}>
            <div className={styles.assetSubIcon}>
              {hasSponsorship ? Sponsored : Scripted}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <img className={cn(styles.assetLogo, className)} src={logo} style={style} />
  );
}
