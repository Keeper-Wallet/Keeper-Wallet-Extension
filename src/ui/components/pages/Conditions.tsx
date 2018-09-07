import * as styles from './styles/conditions.styl';
import * as React from 'react'
import { setTab } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Button } from '../ui/buttons';

@translate('conditions')
class ConditionsComponent extends React.Component {

    props: {
        setTab: (tab) => void
    };

    onClick() {
        this.props.setTab('new');
    }

    render () {
        return <div className={styles.conditions}>
            <div className={styles.contentWrapper}>

                <h3 className={`${styles.title} headline3`}>
                    <Trans i18nKey="title">TERMS AND CONDITIONS</Trans>
                </h3>

                <div className={`basic500 ${styles.attention}`}>
                    <Trans i18nKey="attention">
                        ATTENTION: PLEASE READ CAREFULLY THESE TERMS AND CONDITIONS AS THEY AFFECT
                        YOUR OBLIGATIONS AND LEGAL RIGHTS, INCLUDING, BUT NOT LIMITED TO WAIVERS OF
                        RIGHTS AND LIMITATION OF LIABILITY. IF YOU DO NOT AGREE WITH THESE TERMS AND
                        CONDITIONS DO NOT PROCEED WITH REGISTRATION AT WAVES PLATFORM
                    </Trans>
                </div>

                <div className={`basic500 ${styles.attention}`}>
                    <Trans i18nKey="updated">
                        This version was last updated on 22/06/2018.
                    </Trans>
                </div>

                <div className={`${styles.mark} headline4`}>
                    1. <Trans i18nKey='agreement'>Agreement</Trans>
                </div>

                <div className={`${styles.mark} body1`}>
                    <Trans i18nkey='agreementsText'>
                        This is a contract between you and Waves Platform AG, a joint stock company
                        incorporated in Switzerland or any other legal entity that succeeds Waves Platform Ltd
                        or may be further incorporated (“Company”) and that holds the rights to Waves platform
                        protocol (“Protocol”), website www.wavesplatform.com or any associated websites or
                        mobile applications (“Platform”). By signing up to use an account at the Platform
                        (“Waves Account”), you agree that you are eligible for trololo and tralala.
                    </Trans>
                </div>
            </div>

            <Button onClick={this.onClick.bind(this)} type='submit'>
                <Trans className="text" i18nKey='accept'>Accept</Trans>
            </Button>

        </div>
    }
}

const mapStateToProps = function () {
    return {};
};

export const Conditions = connect(mapStateToProps, { setTab })(ConditionsComponent);
