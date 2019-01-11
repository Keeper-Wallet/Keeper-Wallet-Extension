import * as styles from './styles/permissionsSettings.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { allowOrigin, deleteOrigin, disableOrigin } from '../../actions';
import cn from 'classnames';
import { I18N_NAME_SPACE } from '../../appConfig';


const OriginComponent = (params) => (
    <div className={params.className}>
        <div>{params.origin}</div>
        <div>{params.status}</div>
        <div>
            { params.buttonAction }
            { params.buttonDelete }
        </div>
    </div>
);

@translate(I18N_NAME_SPACE)
class PermissionsSettingsComponent extends React.PureComponent {

    readonly props;
    
    allowHandler = (origin) => {
        this.props.allowOrigin(origin);
    };
    
    disableHandler = (origin) => {
        this.props.disableOrigin(origin);
    };
    
    deleteHandler = (origin) => {
        this.props.deleteOrigin(origin);
    };
    
    render() {
        
        const className = cn(styles.content);
        const origins = Object.entries(this.props.origins);
        
        return <div className={className}>
            <h2 className="title1 margin-main-big">
                <Trans i18nKey='permissionsSettings.title'>Permissions control</Trans>
            </h2>
            
            <div>
                {origins.map(([origin = '', status = []]) => {
    
                    const buttonDisable = <Button type={BUTTON_TYPE.TRANSPARENT}
                                                  onClick={() => this.disableHandler(origin)}>
                        <Trans i18nKey='permissionsSettings.button.disable'>Disallow</Trans>
                    </Button>;
                    
                    const buttonEnable = <Button type={BUTTON_TYPE.TRANSPARENT}
                                                 onClick={() => this.allowHandler(origin)}>
                        <Trans i18nKey='permissionsSettings.button.enable'>Allow</Trans>
                    </Button>;
                    
                    const buttonDelete = <Button type={BUTTON_TYPE.TRANSPARENT}
                                                 onClick={() => this.deleteHandler(origin)}>
                        <Trans i18nKey='permissionsSettings.button.delete'>Delete</Trans>
                    </Button>;
                    
                    const myStatus = status && status[0];
                    
                    const params = {
                        key: origin + myStatus,
                        origin,
                        status: myStatus,
                        buttonAction: myStatus.includes('approved') ? buttonDisable : buttonEnable,
                        buttonDelete,
                    };
                    
                    return <OriginComponent { ...params } />
                })}
            </div>
        </div>
    }
}

const mapStateToProps = function(store) {
    return {
        origins: store.origins
    };
};

const actions = {
    allowOrigin,
    deleteOrigin,
    disableOrigin,
};

export const PermissionsSettings = connect(mapStateToProps, actions)(PermissionsSettingsComponent);
