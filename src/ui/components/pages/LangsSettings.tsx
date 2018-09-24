import * as styles from './styles/langsSettings.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { setLocale } from '../../actions';
import cn from 'classnames';


const Lang = ({ id, name, onSelect, selected }) => {
    const className = cn(styles[id], styles.lang);
    const iconClass = cn(styles.flagIcon, {
        'selected-icon': selected,
        [`flag-${id}-icon`]: !selected
    });

    return <div className={className}>
        <Button className={styles.selectButton} type={BUTTON_TYPE.TRANSPARENT} onClick={onSelect}>
            <Trans i18nKey={`langsSettings.${id}`}>{name}</Trans>
        </Button>
        <div className={iconClass}>F</div>
    </div>;
};

@translate('extension')
class LangsSettingsComponent extends React.Component {

    readonly props;

    render() {
        return <div className={styles.content}>
            <h1>
                <Trans i18nKey='langsSettings.title'>Change the language</Trans>
            </h1>
            <div>
                {
                    this.props.langs.map(({ id, name }) => {
                        return <Lang id={id}
                                     key={id}
                                     name={name}
                                     onSelect={() => this.onSelect(id)}
                                     selected={id === this.props.currentLocale}/>
                    })
                }
            </div>
        </div>
    }

    onSelect(lang) {
        this.props.setLocale(lang);
    }
}

const mapStateToProps = function(store) {
    return {
        currentLocale: store.currentLocale,
        langs: store.langs
    };
};

export const LangsSettings = connect(mapStateToProps, { setLocale })(LangsSettingsComponent);
