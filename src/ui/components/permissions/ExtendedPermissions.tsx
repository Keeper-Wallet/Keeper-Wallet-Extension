import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './settings.styl';
import { Input, Select } from 'ui/components/ui';

const CONFIG: {
  list: Array<{
    id: string;
    i18nKey: string;
    text: string;
    value: number | null;
  }>;
} = {
  list: [
    {
      id: '0m',
      i18nKey: 'permissionSettings.modal.timeOff',
      text: "Don't automatically sign",
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

class ExtendedPermissionsComponent extends React.PureComponent<IProps, IState> {
  state: IState = {
    origin: null,
    interval: null,
    totalAmount: null,
    selected: null,
    canSave: false,
    edited: false,
    showNotify: false,
  };

  static _getAutoSign(autoSign: TAutoAuth | null): TAutoAuth {
    if (!autoSign || typeof autoSign === 'string') {
      return { type: 'allowAutoSign', totalAmount: null, interval: null };
    }

    return autoSign;
  }

  static getDerivedStateFromProps(
    props: Readonly<IProps>,
    state: IState
  ): Partial<IState> {
    const { originName, autoSign, showNotify } = props;

    if (originName === state.origin) {
      return {};
    }

    const { interval = null, totalAmount } =
      ExtendedPermissionsComponent._getAutoSign(autoSign);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const selected = CONFIG.list.find(({ value }) => value === interval)!.id;
    return {
      ...state,
      interval,
      totalAmount: totalAmount,
      selected,
      origin: originName,
      showNotify,
    };
  }

  changeHandler = (
    newInterval: number | null,
    newTotalAmount: string | null,
    showNotify: boolean | null
  ) => {
    newTotalAmount = newInterval ? newTotalAmount : '';
    this.props.onChangePerms({
      type: 'allowAutoSign',
      totalAmount: newTotalAmount,
      interval: newInterval,
      showNotify,
    });
  };

  changeShowNotifyHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const showNotify = event.target.checked;
    this.setState({ showNotify });
    this.changeHandler(this.state.interval, this.state.totalAmount, showNotify);
  };

  selectTimeHandler = (time: string | number) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { value } = CONFIG.list.find(({ id }) => id === time)!;
    this.setState({ interval: value, selected: time });
    this.changeHandler(value, this.state.totalAmount, this.state.showNotify);
  };

  amountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const parsedValue = value
      .replace(/[^0-9.]/g, '')
      .split('.')
      .slice(0, 2);
    if (parsedValue[1]) {
      parsedValue[1] = parsedValue[1].slice(0, 8);
    }

    const newValue = parsedValue.join('.');

    this.setState({ totalAmount: parsedValue.join('.') });
    this.changeHandler(this.state.interval, newValue, this.state.showNotify);
  };

  render(): React.ReactNode {
    const { t, originName } = this.props;

    const timeList = CONFIG.list.map(item => {
      return {
        id: item.id,
        value: item.value,
        text: t(item.i18nKey, { key: item.id }),
      };
    });

    const className = this.props.className;
    const value = (this.state.interval ? this.state.totalAmount : '') || '';
    return (
      <div className={className}>
        <div className={styles.description}>
          {t('permissionSettings.modal.description', { originName })}
        </div>

        <Select
          className={styles.selectTime}
          fill
          selectList={timeList}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selected={this.state.selected!}
          description={t('permissionSettings.modal.time')}
          onSelectItem={this.selectTimeHandler}
        />

        <div className={styles.amount}>
          <div className="left input-title basic500 tag1">
            {t('permissionSettings.modal.amount')}
          </div>
          <Input
            disabled={!this.state.interval}
            onChange={this.amountHandler}
            className={styles.amountInput}
            value={value}
            placeholder="0"
          />
          <div className={styles.waves}>Waves</div>
        </div>

        <div className="flex margin-main-big margin-main-big-top">
          <Input
            id="checkbox_noshow"
            type={'checkbox'}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            checked={this.state.showNotify!}
            onChange={this.changeShowNotifyHandler}
          />
          <label htmlFor="checkbox_noshow">
            {t('notifications.allowSending')}
          </label>
        </div>
      </div>
    );
  }
}

export const ExtendedPermission = withTranslation()(
  ExtendedPermissionsComponent
);

interface IProps extends WithTranslation {
  className?: string;
  autoSign: TAutoAuth | null;
  showNotify: boolean;
  originName: string | undefined;
  onChangePerms: (permission: TAutoAuth) => void;
}

type TAutoAuth = {
  type: 'allowAutoSign';
  totalAmount: string | null;
  interval: number | null;
  approved?: unknown[];
  showNotify?: boolean | null;
};

interface IState {
  interval: number | null;
  totalAmount: string | null;
  selected: string | number | null;
  origin: string | null;
  canSave: boolean;
  edited: boolean;
  showNotify: boolean | null;
}
