import { AssetsRecord } from 'assets/types';
import { PopupState } from 'popup/store/types';
import { connect } from 'react-redux';

import { getAsset } from '../../../../store/actions/assets';
import { Loader } from '../loader';

const AssetComponent = ({
  // eslint-disable-next-line @typescript-eslint/no-shadow
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

export const Asset = connect(({ assets }: PopupState) => ({ assets }), {
  getAsset,
})(AssetComponent);

interface IProps {
  assetId: string;
  children?: React.ReactNode;
  className?: string;
  assets: AssetsRecord;
  getAsset: (id: string) => void;
}
