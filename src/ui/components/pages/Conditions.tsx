import * as styles from './styles/conditions.styl';
import * as React from 'react'
import { setTab } from '../../actions';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { ConditionsAndTerms } from '../conditions/Conditions';
import { I18N_NAME_SPACE } from '../../appConfig';

interface IConditionsComponentProps {
    setTab(tab: string): void;
}

@translate(I18N_NAME_SPACE)
class ConditionsComponent extends React.Component<IConditionsComponentProps> {
    onClick(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        this.props.setTab('new');
    }

    render () {
        return (
            <div className={`body1 height ${styles.contentWrapper}`}>
                <div className={`${styles.conditionsContent} height`}>
                    <h3 className={`${styles.title} headline3 margin3`}>
                        <Trans i18nKey="conditions.title">TERMS AND CONDITIONS</Trans>
                    </h3>

                    <ConditionsAndTerms />
                </div>

                <Button
                    className={`centered ${styles.acceptTermsBtn}`}
                    onClick={this.onClick.bind(this)}
                    type={BUTTON_TYPE.GENERAL}
                >
                    <Trans className="text" i18nKey='conditions.close'>Close</Trans>
                </Button>
            </div>
        );
    }
}

export const Conditions = connect(null, { setTab })(ConditionsComponent);
