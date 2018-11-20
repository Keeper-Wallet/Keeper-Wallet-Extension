import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from './bottom.styl';
import { translate, Trans } from 'react-i18next';
import cn from 'classnames';
import { setNetwork, loading } from '../../actions';
import { I18N_NAME_SPACE } from '../../appConfig';

const key = (key) => `bottom.${key}`;

const Networks = ({isShow, onSelect, selectedNet, networks}) => {
    if (!isShow) {
        return null;
    }

    return <div className={styles.selectNetworks}>{
        networks.map((net) => {
            const currentNetwork = net.name;
            const selected = selectedNet === currentNetwork;
            const className = cn(
                styles.network,
                {
                    'basic500': selected,
                    [styles.selectedNet]: selected,
                }
            );

            const onSelectNet = selected ? null : () => onSelect(net);

            return <div onClick={onSelectNet} className={className} key={currentNetwork}>
                  <span>
                    <Trans i18nKey={key(currentNetwork)}>{currentNetwork}</Trans>
                </span>
            </div>
        })
    }</div>;
};

@translate(I18N_NAME_SPACE)
class BottomComponent extends React.Component {

    props: IProps;
    state = {showNetworks: false};
    
    clickHandler = () => {
        this.addClickOutHandler();
        this.setState({ showNetworks: !this.props.noChangeNetwork });
    };
    
    selectHandler = (net) => {
        if (net) {
            this.props.setNetwork(net.name);
            this.props.loading(true);
            setTimeout(() => this.props.loading(false), 1000);
        }
        this.clickOutHandler();
    };
    
    clickOutHandler = () => {
        this.removeClickOutHandler();
        this.setState({ showNetworks: false });
    };

    render() {

        const className = cn(
            styles.bottom,
            this.props.className,
            {
                [styles.hidden]: this.props.locked || !this.props.initialized || this.props.hide
            });
        const networkClassName = cn(
                styles.network,
                'basic500',
                {
                    [styles.disabledNet]: this.props.noChangeNetwork,
                }
            );
        const currentNetwork = this.props.currentNetwork || 'mainnet';

        return <div className={className}>
            <div className={networkClassName} onClick={this.clickHandler} key={currentNetwork}>
                <span>
                    <Trans i18nKey={key(currentNetwork)}>{currentNetwork}</Trans>
                </span>
            </div>

            <Networks isShow={this.state.showNetworks}
                      networks={this.props.networks}
                      selectedNet={this.props.currentNetwork}
                      onSelect={this.selectHandler}/>

            <div className={'basic500'}>
                v {this.props.version}
            </div>
        </div>
    }

    componentWillUnmount() {
        this.removeClickOutHandler();
    }

    removeClickOutHandler() {
        document.removeEventListener('click', this.clickOutHandler);
    }

    addClickOutHandler() {
        document.addEventListener('click', this.clickOutHandler);
    }
}

const mapStateToProps = ({currentNetwork, version, state, networks}) => ({
    currentNetwork,
    networks,
    version,
    locked: state && state.locked,
    initialized: state && state.initialized,
});

export const Bottom = connect(mapStateToProps, { setNetwork, loading })(BottomComponent);

interface IProps {
    className?: string;
    currentNetwork: string;
    noChangeNetwork: boolean;
    hide?: boolean;
    networks: Array<{ name: string, code: string }>;
    version: string;
    locked: boolean;
    initialized: boolean;
    setNetwork: (net: string) => void;
    loading: (show: boolean) => void;
}
