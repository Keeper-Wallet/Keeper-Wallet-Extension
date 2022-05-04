import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from './bottom.styl';
import cn from 'classnames';
import { loading, setNetwork } from '../../actions';
import { Network } from './components';

interface Props {
  className?: string;
  noChangeNetwork?: boolean;
  hide?: boolean;
  version: string;
  locked: boolean;
  initialized: boolean;
}

class BottomComponent extends React.Component<Props> {
  render() {
    const hideNet =
      this.props.locked || !this.props.initialized || this.props.hide;

    const className = cn(styles.bottom, this.props.className, {
      [styles.hidden]: hideNet,
    });

    return (
      <div className={className}>
        <Network noChangeNetwork={this.props.noChangeNetwork} />

        <div className="version basic500" data-testid="currentVersion">
          v {this.props.version}
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ version, state }) => ({
  version,
  locked: state && state.locked,
  initialized: state && state.initialized,
});

export const Bottom = connect(mapStateToProps, { setNetwork, loading })(
  BottomComponent
);
