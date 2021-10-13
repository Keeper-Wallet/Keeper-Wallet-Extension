import * as React from 'react';

export class UnknownInfo extends React.PureComponent<IOriginAuthInfo> {
    render() {
        return <div></div>;
    }
}

interface IOriginAuthInfo {
    message: any;
    assets: any;
}
