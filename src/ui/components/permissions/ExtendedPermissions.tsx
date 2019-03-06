import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from 'ui/appConfig';
import cn from 'classnames';
import * as styles from './settings.styl';
import { Input, Select } from 'ui/components/ui';


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
class ExtendedPermissionsComponent extends React.PureComponent<IProps, IState> {
    
    state = {
        origin: null,
        interval: null,
        totalAmount: null,
        selected: null,
        canSave: false,
        edited: false,
    };
    
    openHandler = () => {
    
    };
    
    changeHandler = (newInterval, newTotalAmount) => {
        newTotalAmount = newInterval ? newTotalAmount : '';
        this.props.onChangePerms({ type: 'allowAutoSign', totalAmount: newTotalAmount, interval: newInterval })
    };
    
    selectTimeHandler = time => {
        const { value } = CONFIG.list.find(({ id }) => id === time);
        this.setState({ interval: value, selected: time });
        this.changeHandler(value, this.state.totalAmount);
    };
    
    amountHandler = (event) => {
        const { value } = event.target;
        const parsedValue = value.replace(/[^0-9.]/g, '')
            .split('.').slice(0, 2);
        if (parsedValue[1]) {
            parsedValue[1] = parsedValue[1].slice(0, 8);
        }

        const newValue = parsedValue.join('.');
        
        this.setState({ totalAmount: parsedValue.join('.') });
        this.changeHandler(this.state.interval, newValue);
    };
    
    render(): React.ReactNode {
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
                <div className={styles.description}>
                    <Trans i18nKey='permissionSettings.modal.description' originName={originName}>
                        This allows {{originName}} to automatically sign transactions on your behalf.
                    </Trans>
                </div>
                
                <Select className={cn(styles.selectTime, styles.margin12)}
                        selectList={timeList}
                        selected={this.state.selected}
                        description={<Trans i18nKey='permissionSettings.modal.time'>Resolution time</Trans>}
                        onSelectItem={this.selectTimeHandler}/>
    
                <div className={cn(styles.amount, styles.margin12)}>
                        <div className='left input-title basic500 tag1'>
                            <Trans i18nKey='permissionSettings.modal.amount'>Spending limit</Trans>
                        </div>
                        <Input disabled={!this.state.interval}
                               onChange={this.amountHandler}
                               className={styles.amountInput}
                               value={value} placeholder={0}/>
                        <div className={styles.waves}>Waves</div>
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
        const { originName, autoSign } = props;
        
        if (originName === state.origin) {
            return state;
        }
        
        const { interval = null, totalAmount } = ExtendedPermissionsComponent._getAutoSign(autoSign);
    
        const selected = CONFIG.list.find(({ value }) => value === interval).id;
        return { ...state, interval, totalAmount: totalAmount, selected, origin: originName };
    }
}

export const ExtendedPermission = ExtendedPermissionsComponent;



interface IProps extends React.ComponentProps<'div'> {
    autoSign: TAutoAuth;
    originName: string;
    onChangePerms?: (permission: TAutoAuth) => void;
}

type TAutoAuth = {
    type: 'allowAutoSign';
    totalAmount: number;
    interval: number;
    approved?: Array<any>;
};


interface IState {
    interval: number|null;
    totalAmount: number|null;
    selected: string;
    origin: string|null;
}






















