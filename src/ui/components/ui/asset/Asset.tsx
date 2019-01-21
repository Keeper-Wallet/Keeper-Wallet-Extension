import * as React from 'react';
import { ASSETS_NAMES } from '../../../appConfig';
import { connect } from 'react-redux';
import { getAsset } from '../../../actions';
import { Loader } from '../loader';

const Loading = ({ children }) => {
    return <div>
        <Loader/>
        {children}
    </div>;
};

const AssetComponent = ({ getAsset, children, assets, assetId, ...props }: IProps) => {
    
    if (!assets[assetId]) {
        getAsset(assetId);
        return <Loading>{children}</Loading>;
    }
    
    const assetName = assets[assetId] ? ASSETS_NAMES[assetId] || assets[assetId].name : null;
    
    return <span {...props}>
        {assetName}
        {children}
    </span>;
};


export const Asset = connect(({ assets }: any) => ({ assets }), { getAsset })(AssetComponent);

interface IProps {
    assetId: string;
    children?: any;
    className?: string;
    assets?: Object;
    getAsset: (id: string) => void;
}
