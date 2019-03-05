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
    };
    
    selectTimeHandler = time => {
        const { value } = CONFIG.list.find(({ id }) => id === time);
        this.setState({ interval: value, edited: true, selected: time });
        this.calculateCanSave(value, this.state.totalAmount);
    };
    
    calculateCanSave(newInterval, newTotalAmount): void {
        const sign = OriginSettingsComponent._getAutoSign(this.props.autoSign);
        let canSave = false;
        
        newTotalAmount = newInterval ? newTotalAmount : '';
        
        if (Number(sign.interval) !== Number(newInterval)) {
            canSave = true;
        }
        
        if (Number(sign.totalAmount || 0) !== Number(newTotalAmount || 0)) {
            canSave = true;
        }
        
        if (!Number(newTotalAmount) && Number(newInterval)) {
            canSave = false;
        }
        
        this.setState({ canSave });
        
        this.props.onChangePerms({ type: 'allowAutoSign', totalAmount: newTotalAmount, interval: newInterval  })
    }
    
    deleteHandler = () => {
        this.props.onDelete(this.props.originName);
    };
    
    saveHandler = () => {
        const { interval, totalAmount } = this.state;
        const data = { interval: Number(interval) || null, totalAmount: Number(totalAmount) * (10 ** 8) || null };
        this.props.onSave(data, this.props.originName);
    };
    
    amountHandler = (event) => {
        const { value } = event.target;
        const parsedValue = value.replace(/[^0-9.]/g, '')
            .split('.').slice(0, 2);
        if (parsedValue[1]) {
            parsedValue[1] = parsedValue[1].slice(0, 8);
        }

        const newValue = parsedValue.join('.');
        
        this.setState({ totalAmount: parsedValue.join('.'), edited: true });
        this.calculateCanSave(this.state.interval, newValue);
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
        
        return (
            <div className={className}>
                <h2 className={cn(styles.margin24, styles.title)}>
                    <Trans i18nKey='permissionSettings.modal.title'>Permission details</Trans>
                </h2>
                
                <div className={styles.description}>
                    <Trans i18nKey='permissionSettings.modal.description' originName={originName}>
                        This allows {{originName}} to automatically sign transactions on your behalf.
                    </Trans>
                </div>
                
                <Select className={cn(styles.selectTime, styles.margin24)}
                        selectList={timeList}
                        selected={this.state.selected}
                        description={<Trans i18nKey='permissionSettings.modal.time'>Resolution time</Trans>}
                        onSelectItem={this.selectTimeHandler}/>
    
                {
                    !this.state.interval ? null : <div className={cn(styles.amount, styles.margin24)}>
                        <div className='left input-title basic500 tag1'>
                            <Trans i18nKey='permissionSettings.modal.amount'>Spending limit</Trans>
                        </div>
                        <Input onChange={this.amountHandler} className={styles.amountInput} value={this.state.totalAmount || ''} placeholder={0}/>
                        <div className={styles.waves}>Waves</div>
                    </div>
                }
                <div className={cn(styles.bottomBtns)}>
                    <div className={styles.btnWrapper}>
                        {
                            !inWhiteList ? <Button onClick={this.deleteHandler} type={BUTTON_TYPE.WARNING}>
                                <Trans i18nKey="permissionSettings.modal.delete">Delete</Trans>
                            </Button> : null
                        }
                        {
                            !inWhiteList ? <div className={styles.btnDivider}/> : null
                        }
                        <Button type={BUTTON_TYPE.GENERAL} disabled={!this.state.canSave} onClick={this.saveHandler}>
                            <Trans i18nKey="permissionSettings.modal.save">Save</Trans>
                        </Button>
                    </div>
                    <Button className={styles.cancelBtn} type={BUTTON_TYPE.TRANSPARENT} onClick={this.props.onClose}>
                        <Trans i18nKey="permissionSettings.modal.cancel">Cancel</Trans>
                    </Button>
                </div>
            </div>
            );
    }
    
    static _getAutoSign(autoSign: TAutoAuth): TAutoAuth {
        if (!autoSign || typeof autoSign === 'string') {
            return { type: 'allowAutoSign', totalAmount: null, interval: null };
        }
        
        return autoSign;
    }
    
    static getDerivedStateFromProps(props: IProps, state: IState): Partial<IState> {
        const { interval = null, totalAmount } = OriginSettingsComponent._getAutoSign(props.autoSign);
        const selected = CONFIG.list.find(({ value }) => value === interval).id;
        return { ...state, interval, totalAmount: totalAmount, selected };
    }
}


export const OriginSettings = OriginSettingsComponent;


interface IProps extends React.ComponentProps<'div'> {
    autoSign: TAutoAuth;
    permissions: Array<TPermission>;
    originName: string;
    onSave?: (params: Partial<TAutoAuth>, origin: string) => void;
    onClose?: () => void;
    onDelete?: (origin: string) => void;
    onChangePerms?: (permission: TAutoAuth) => void;
}

type TPermission = string|TAutoAuth

type TAutoAuth = {
    type: 'allowAutoSign';
    totalAmount: number;
    interval: number;
    approved?: Array<any>;
};


interface IState {
    interval: number|null;
    totalAmount: number|null;
    canSave: boolean;
    edited: boolean;
    selected: string;
}






















