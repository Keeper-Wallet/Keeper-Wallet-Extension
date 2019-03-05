import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from './bottom.styl';
import { translate, Trans } from 'react-i18next';
import cn from 'classnames';
import { setNetwork, loading } from '../../actions';
import { I18N_NAME_SPACE } from '../../appConfig';
import { Network } from './components';

@translate(I18N_NAME_SPACE)
class BottomComponent extends React.Component {
    
    props: IProps;
    
    render() {
        
        const hideNet = this.props.locked || !this.props.initialized || this.props.hide;
        
        const className = cn(
            styles.bottom,
            this.props.className,
            {
                [styles.hidden]: hideNet
            });

        return <div className={className}>
            <Network noChangeNetwork={this.props.noChangeNetwork}/>
            
            <div className={'basic500'}>
                v {this.props.version}
            </div>
        </div>
    }
}

const mapStateToProps = ({ version, state }) => ({
    version,
    locked: state && state.locked,
    initialized: state && state.initialized,
});

export const Bottom = connect(mapStateToProps, { setNetwork, loading })(BottomComponent);

interface IProps {
    className?: string;
    noChangeNetwork: boolean;
    hide?: boolean;
    version: string;
    locked: boolean;
    initialized: boolean;
}
