import { AssetsRecord } from 'assets/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'ui/store';
import { getAsset } from '../../../actions/assets';
import { Loader } from '../loader';

const AssetComponent = ({
  getAsset,
  children,
  assets,
  assetId,
  ...props
}: IProps) => {
  const asset = assets[assetId];

  if (!asset) {
    getAsset(assetId);

    return (
      <div>
        <Loader />
        {children}
      </div>
    );
  }

  return (
    <span {...props}>
      {asset.displayName}
      {children}
    </span>
  );
};

export const Asset = connect(({ assets }: AppState) => ({ assets }), {
  getAsset,
})(AssetComponent);

interface IProps {
  assetId: string;
  children?: React.ReactNode;
  className?: string;
  assets: AssetsRecord;
  getAsset: (id: string) => void;
}
