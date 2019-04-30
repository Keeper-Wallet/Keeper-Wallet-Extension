import * as styles from './styles/conditions.styl';
import * as React from 'react'
import { setTab } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { ConditionsAndTerms } from '../conditions/Conditions';
import { I18N_NAME_SPACE } from '../../appConfig';

const SCROLL_DELTA = -15;

@translate(I18N_NAME_SPACE)
class ConditionsComponent extends React.Component {

    onScroll = e => this._onScroll(e);

    props: {
        setTab: (tab) => void
    };

    state = { confirmDisabled: true };

    onClick(e) {
        e.stopPropagation();
        e.preventDefault();
        this.props.setTab('new');
    }

    _onScroll(e) {
        if (!this.state.confirmDisabled ) {
            return null;
        }
        
        const height =  e.target.scrollTop + e.target.offsetHeight - e.target.scrollHeight;
        const confirmDisabled = height <= SCROLL_DELTA;
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

            <Button className={`centered ${styles.acceptTermsBtn}`}
                    onClick={this.onClick.bind(this)}
                    type={BUTTON_TYPE.GENERAL}
                    disabled={this.state.confirmDisabled}>
                <Trans className="text" i18nKey='conditions.accept'>Accept</Trans>
            </Button>

        </div>
    }
}

const mapStateToProps = function () {
    return {};
};

export const Conditions = connect(mapStateToProps, { setTab })(ConditionsComponent);
