import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from './bottom.styl';
import { translate, Trans } from 'react-i18next';
import cn from 'classnames';

const key = (key) => `bottom.${key}`;

@translate('extension')
class BottomComponent extends React.PureComponent {

    props: IProps;

    render() {

        const className = cn(
            styles.bottom,
            this.props.className,
            {
                [styles.hidden]: this.props.locked || !this.props.initialized
            });

        return <div className={className}>
            <div className={`${styles.network} basic500`}>
                <span>
                    <Trans i18nKey={key(this.props.currentNetwork)}>{this.props.currentNetwork}</Trans>
                </span>
            </div>
            <div className={'basic500'}>
                v {this.props.version}
            </div>
        </div>
    }

}

const mapStateToProps = ({ currentNetwork, version, state }) => ({
    currentNetwork,
    version,
    locked: state && state.locked,
    initialized: state && state.initialized,
});

export const Bottom = connect(mapStateToProps)(BottomComponent);

interface IProps {
    className?: string;
    currentNetwork: string;
    version: string;
    locked: boolean;
    initialized: boolean;
}
