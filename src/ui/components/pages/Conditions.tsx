import * as styles from './styles/conditions.styl';
import * as React from 'react'
import { setTab } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Button } from '../ui/buttons';

@translate('conditions')
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
            this.setState({confirmDisabled});
        }
    }

    render () {
        return <div className={`body1 height ${styles.contentWrapper}`} onScroll={this.onScroll}>
            <div className={`${styles.conditionsContent} height`}>

                <h3 className={`${styles.title} headline3 margin3`}>
                    <Trans i18nKey="title">TERMS AND CONDITIONS</Trans>
                </h3>

                <div className={`basic500 margin2 font300`}>
                    <Trans i18nKey="attention">
                        ATTENTION: PLEASE READ CAREFULLY THESE TERMS AND CONDITIONS AS THEY AFFECT
                        YOUR OBLIGATIONS AND LEGAL RIGHTS, INCLUDING, BUT NOT LIMITED TO WAIVERS OF
                        RIGHTS AND LIMITATION OF LIABILITY. IF YOU DO NOT AGREE WITH THESE TERMS AND
                        CONDITIONS DO NOT PROCEED WITH REGISTRATION AT WAVES PLATFORM
                    </Trans>
                </div>

                <div className={`basic500 margin3 font300`}>
                    <Trans i18nKey="updated">
                        This version was last updated on 22/06/2018.
                    </Trans>
                </div>

                <div className={`headline3 margin2 font500`}>
                    1. <Trans i18nKey='agreement'>Agreement</Trans>
                </div>

                <div>
                    <Trans i18nkey='agreementsText'>
                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.

                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.

                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.

                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.

                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.

                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.

                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.
                    </Trans>
                </div>
            </div>

            <Button onClick={this.onClick.bind(this)} type='submit' disabled={this.state.confirmDisabled}>
                <Trans className="text" i18nKey='accept'>Accept</Trans>
            </Button>

        </div>
    }
}

const mapStateToProps = function () {
    return {};
};

export const Conditions = connect(mapStateToProps, { setTab })(ConditionsComponent);
