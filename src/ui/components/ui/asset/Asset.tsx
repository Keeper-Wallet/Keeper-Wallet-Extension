import { AssetDetail } from 'assets/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'ui/store';
import { getAsset } from '../../../actions';
import { Loader } from '../loader';

const AssetComponent = ({
  getAsset,
  children,
  assets,
  assetId,
  ...props
}: IProps) => {
  if (!assets[assetId]) {
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
      {assets[assetId].displayName}
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
  assets: Record<string, AssetDetail>;
  getAsset: (id: string) => void;
}
