import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from 'ui/appConfig';
import cn from 'classnames';
import * as styles from './settings.styl';
import { Input, Button, BUTTON_TYPE, Select } from 'ui/components/ui';

const CONFIG = {
    list: [
        {
            id: '0m',
            i18nKey: 'permissionSettings.modal.timeOff',
            text: 'Don\'t automatically sign',
            value: null,
        },
        {
            id: '15m',
            i18nKey: 'permissionSettings.modal.time15m',
            text: 'For 15 minutes',
            value: 15 * 60 * 1000,
        },
        {
            id: '30m',
            i18nKey: 'permissionSettings.modal.time30m',
            text: 'For 30 minutes',
            value: 30 * 60 * 1000,
        },
        {
            id: '60m',
            i18nKey: 'permissionSettings.modal.time60m',
            text: 'For 1 hour',
            value: 60 * 60 * 1000,
        },
    ],
};

@translate(I18N_NAME_SPACE)
class OriginSettingsComponent extends React.PureComponent<IProps, IState> {
    
    state = {
        interval: null,
        totalAmount: null,
        selected: null,
        canSave: false,
        edited: false,
        notifications: null,
        canShowNotifications: null,
    };
    
    canUseNotificationsHandler = (e) => {
        this.setState({ canShowNotifications: e.target.checked });
        this.calculateCanSave(this.state.interval, this.state.totalAmount, e.target.checked);
    };
    
    selectTimeHandler = time => {
        const { value } = CONFIG.list.find(({ id }) => id === time);
        this.setState({ interval: value, edited: true, selected: time });
        this.calculateCanSave(value, this.state.totalAmount, this.state.canShowNotifications);
    };
    
    calculateCanSave(newInterval, newTotalAmount, newCanShowNotifications): void {
        const sign = OriginSettingsComponent._getAutoSign(this.props.autoSign);
        let canSave = false;
        
        newTotalAmount = newInterval ? newTotalAmount : '';
        
        if(newCanShowNotifications !== !!this.state.notifications) {
            canSave = true;
        }
        
        if(Number(sign.interval) !== Number(newInterval)) {
            canSave = true;
        }
        
        if(Number(sign.totalAmount || 0) !== Number(newTotalAmount || 0)) {
            canSave = true;
        }
        
        if(!Number(newTotalAmount) && Number(newInterval)) {
            canSave = false;
        }
        
        this.setState({ canSave });
        
        this.props.onChangePerms({ type: 'allowAutoSign', totalAmount: newTotalAmount, interval: newInterval })
    }
    
    deleteHandler = () => {
        this.props.onDelete(this.props.originName);
    };
    
    saveHandler = () => {
        const { interval, totalAmount, canShowNotifications } = this.state;
        const data = { interval: Number(interval) || null, totalAmount: Number(totalAmount) * (10 ** 8) || null };
        this.props.onSave(data, this.props.originName, canShowNotifications);
    };
    
    amountHandler = (event) => {
        const { value } = event.target;
        const parsedValue = value.replace(/[^0-9.]/g, '')
            .split('.').slice(0, 2);
        if(parsedValue[1]) {
            parsedValue[1] = parsedValue[1].slice(0, 8);
        }
        
        const newValue = parsedValue.join('.');
        
        this.setState({ totalAmount: parsedValue.join('.'), edited: true });
        this.calculateCanSave(this.state.interval, newValue, this.state.canShowNotifications);
    };
    
    render(): React.ReactNode {
        const inWhiteList = this.props.permissions.includes('whiteList');
        
        const timeList = CONFIG.list.map(item => {
            return {
                id: item.id,
                value: item.value,
                text: <Trans i18nKey={item.i18nKey} key={item.id}>{item.text}</Trans>
            };
        });
        
        const { originName } = this.props;
        const className = cn(styles.settings, styles.inModal, this.props.className);
        const value = (this.state.interval ? this.state.totalAmount : '') || '';
        
        return (
            <div className={className}>
                
                <h2 className={cn(styles.title)}>
                    <Trans i18nKey='permissionSettings.modal.title'>Permission details</Trans>
                </h2>
                
                <div className={styles.description}>
                    <Trans i18nKey='permissionSettings.modal.description' originName={originName}>
                        This allows {{ originName }} to automatically sign transactions on your behalf.
                    </Trans>
                </div>
                
                <Select className={cn(styles.selectTime)}
                        selectList={timeList}
                        selected={this.state.selected}
                        description={<Trans i18nKey='permissionSettings.modal.time'>Resolution time</Trans>}
                        onSelectItem={this.selectTimeHandler}/>
                
                <div className={cn(styles.amount)}>
                    <div className='left input-title basic500 tag1'>
                        <Trans i18nKey='permissionSettings.modal.amount'>Spending limit</Trans>
                    </div>
                    <Input disabled={!this.state.interval}
                           onChange={this.amountHandler}
                           className={styles.amountInput}
                           value={value}
                           placeholder={0}/>
                    <div className={styles.waves}>Waves</div>
                </div>
                
                <div className="flex margin-main-big margin-main-big-top">
                    <Input id='checkbox_noshow'
                           type={'checkbox'}
                           checked={this.state.canShowNotifications}
                           onChange={this.canUseNotificationsHandler}
                    />
                    <label htmlFor='checkbox_noshow'>
                        <Trans i18nkey='notifications.allowSending'>Allow sending messages</Trans>
                    </label>
                </div>
                
                
                {!inWhiteList ? <div className="buttons-wrapper">
                        <Button onClick={this.deleteHandler} type={BUTTON_TYPE.WARNING}>
                            <Trans i18nKey="permissionSettings.modal.delete">Delete</Trans>
                        </Button>
                        
                        <Button className={styles.test} type={BUTTON_TYPE.GENERAL} disabled={!this.state.canSave}
                                onClick={this.saveHandler}>
                            <Trans i18nKey="permissionSettings.modal.save">Save</Trans>
                        </Button>
                    </div> :
                    <Button className={styles.test} type={BUTTON_TYPE.GENERAL} disabled={!this.state.canSave}
                            onClick={this.saveHandler}>
                        <Trans i18nKey="permissionSettings.modal.save">Save</Trans>
                    </Button>}
                
                <Button className={styles.cancelBtn} type={BUTTON_TYPE.TRANSPARENT} onClick={this.props.onClose}>
                    <Trans i18nKey="permissionSettings.modal.cancel">Cancel</Trans>
                </Button>
                
            </div>
        );
    }
    
    static _getAutoSign(autoSign: TAutoAuth): TAutoAuth {
        if(!autoSign || typeof autoSign === 'string') {
            return { type: 'allowAutoSign', totalAmount: null, interval: null };
        }
        
        return autoSign;
    }
    
    static getDerivedStateFromProps(props: IProps, state: IState): Partial<IState> {
        const { interval = null, totalAmount } = OriginSettingsComponent._getAutoSign(props.autoSign);
        const selected = CONFIG.list.find(({ value }) => value === interval).id;
        const notifications = props.permissions.find((item: TNotification) => item && item.type === 'useNotifications') as TNotification;
        let canShowNotifications = state.canShowNotifications;
        if(canShowNotifications === null && !!notifications) {
            canShowNotifications = true;
        }
        return { ...state, interval, totalAmount: totalAmount, selected, notifications, canShowNotifications };
    }
}


export const OriginSettings = OriginSettingsComponent;


interface IProps extends React.ComponentProps<'div'> {
    autoSign: TAutoAuth;
    permissions: Array<TPermission>;
    originName: string;
    onSave?: (params: Partial<TAutoAuth>, origin: string, canShowNotifications: boolean) => void;
    onClose?: () => void;
    onDelete?: (origin: string) => void;
    onChangePerms?: (permission: TAutoAuth) => void;
}

type TPermission = string | TAutoAuth | TNotification;

type TAutoAuth = {
    type: 'allowAutoSign';
    totalAmount: number;
    interval: number;
    approved?: Array<any>;
};


type TNotification = {
    type: 'useNotifications',
    time: number,
}

interface IState {
    interval: number | null;
    totalAmount: number | null;
    canSave: boolean;
    edited: boolean;
    selected: string;
    notifications: TNotification;
    canShowNotifications: boolean | null;
}






















