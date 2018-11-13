import * as styles from './styles/conditions.styl';
import * as React from 'react'
import { setTab } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Button } from '../ui/buttons';
import { ConditionsAndTerms } from '../conditions/Conditions';

@translate('extension')
class ConditionsComponent extends React.Component {

    onScroll = e => this._onScroll(e);

    props: {
        setTab: (tab) => void
    };

    state = { confirmDisabled: true };

    onClick() {
        this.props.setTab('new');
    }

    _onScroll(e) {
        if (!this.state.confirmDisabled ) {
            return null;
        }

        const height = e.target.scrollHeight - e.target.scrollTop - e.target.offsetHeight;
        const confirmDisabled = height > 5;

        if (this.state.confirmDisabled !== confirmDisabled) {
            this.setState({ confirmDisabled });
        }
    }

    render () {
        return <div className={`body1 height ${styles.contentWrapper}`} onScroll={this.onScroll}>
            <div className={`${styles.conditionsContent} height`}>

                <h3 className={`${styles.title} headline3 margin3`}>
                    <Trans i18nKey="conditions.title">TERMS AND CONDITIONS</Trans>
                </h3>

                <ConditionsAndTerms/>
                
            </div>

            <Button className="centered" onClick={this.onClick.bind(this)} type='submit' disabled={this.state.confirmDisabled}>
                <Trans className="text" i18nKey='conditions.accept'>Accept</Trans>
            </Button>

        </div>
    }
}

const mapStateToProps = function () {
    return {};
};

export const Conditions = connect(mapStateToProps, { setTab })(ConditionsComponent);
