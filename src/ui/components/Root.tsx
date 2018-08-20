import * as React from 'react';
import { connect } from 'react-redux';

export class Root extends React.Component<any, any> {

    public background: any;

    constructor(props: any) {
        super(props);
        debugger;
        this.background = props.background;
    }

    render () {
        return <div className="root">Hello</div>;
    }
}

const mapStateToProps = function(store: any) {
    return {
        state: store.state
    };
};

export default connect(mapStateToProps)(Root);
