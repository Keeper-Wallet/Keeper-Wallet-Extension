import * as React from 'react';
import * as styles from './assets.styl';
import cn from 'classnames';
import ColorHash from 'color-hash';

interface Props extends React.HTMLProps<HTMLImageElement> {
  assetId: string;
  name: string;
  logo?: string;
}

export function AssetLogo({ className, assetId, logo, name }: Props) {
  const style = {
    backgroundColor: new ColorHash().hex(assetId),
  };
  if (!logo) {
    return (
      <div className={cn(styles.assetLogo, className)} style={style}>
        {name && name[0].toUpperCase()}
      </div>
    );
  }

  return (
    <img className={cn(styles.assetLogo, className)} src={logo} style={style} />
  );
}
