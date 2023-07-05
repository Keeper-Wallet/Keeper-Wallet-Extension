import { BigNumber } from '@waves/bignumber';
import clsx from 'clsx';
import { PureComponent } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';
import { Button, Input, Select } from 'ui/components/ui';

import * as styles from './settings.styl';

const CONFIG = {
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

class OriginSettingsComponent extends PureComponent<IProps, IState> {
  state: IState = {
    interval: null,
    totalAmount: null,
    selected: null,
    canSave: false,
    edited: false,
    notifications: null,
    canShowNotifications: null,
  };

  static _getAutoSign(autoSign: TAutoAuth): TAutoAuth {
    if (!autoSign || typeof autoSign === 'string') {
      return { type: 'allowAutoSign', totalAmount: null, interval: null };
    }

    return autoSign;
  }

  static getDerivedStateFromProps(
    props: Readonly<IProps>,
    state: IState,
  ): Partial<IState> {
    const { interval = null, totalAmount } =
      OriginSettingsComponent._getAutoSign(props.autoSign);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const selected = CONFIG.list.find(({ value }) => value === interval)!.id;
    const notifications = props.permissions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      item => item && (item as any).type === 'useNotifications',
    ) as TNotification;
    const inWhiteList = (props.origins[props.originName] || []).includes(
      'whiteList',
    );
    let canShowNotifications = state.canShowNotifications;
    const canUse = notifications && notifications.canUse;
    const canUseNotify = canUse || (canUse == null && inWhiteList);

    if (canShowNotifications === null && canUseNotify) {
      canShowNotifications = true;
    }

    if (props.originName == null) {
      canShowNotifications = null;
    }

    return {
      ...state,
      interval,
      totalAmount,
      selected,
      notifications,
      canShowNotifications,
    };
  }

  onClose = () => {
    this.setState({
      interval: null,
      totalAmount: null,
      selected: null,
      canSave: false,
      edited: false,
      notifications: null,
      canShowNotifications: null,
    });

    this.props.onClose();
  };

  canUseNotificationsHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ canShowNotifications: e.target.checked });
    this.calculateCanSave(
      this.state.interval,
      this.state.totalAmount,
      e.target.checked,
    );
  };

  selectTimeHandler = (time: number | string) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { value } = CONFIG.list.find(({ id }) => id === time)!;
    this.setState({ interval: value, edited: true, selected: time });
    this.calculateCanSave(
      value,
      this.state.totalAmount,
      this.state.canShowNotifications,
    );
  };

  calculateCanSave(
    newInterval: number | null,
    newTotalAmount: string | null,
    newCanShowNotifications: boolean | null,
  ) {
    const sign = OriginSettingsComponent._getAutoSign(
      this.props.originalAutoSign,
    );
    let canSave = false;

    newTotalAmount = newInterval ? newTotalAmount : '';

    if (newCanShowNotifications !== !!this.state.notifications) {
      canSave = true;
    }

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

    this.props.onChangePerms({
      type: 'allowAutoSign',
      totalAmount: newTotalAmount,
      interval: newInterval,
    });
  }

  deleteHandler = () => {
    this.props.onDelete(this.props.originName);
  };

  saveHandler = () => {
    const { interval, totalAmount, canShowNotifications } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const res = new BigNumber(totalAmount!).mul(10 ** 8);
    const data = {
      interval: Number(interval) || null,
      totalAmount: res.isNaN() ? null : res.toFixed(0),
    };
    this.props.onSave(data, this.props.originName, canShowNotifications);
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

    this.setState({ totalAmount: parsedValue.join('.'), edited: true });
    this.calculateCanSave(
      this.state.interval,
      newValue,
      this.state.canShowNotifications,
    );
  };

  render(): React.ReactNode {
    const inWhiteList = this.props.permissions.includes('whiteList');
    const { t, originName } = this.props;

    const timeList = CONFIG.list.map(item => {
      return {
        id: item.id,
        value: item.value,
        text: t(item.i18nKey, { key: item.id }),
      };
    });

    const totalAmount = this.state.totalAmount || '';
    const value = (this.state.interval ? totalAmount : '') || '';

    return (
      <div className="modal cover">
        <div id="originSettings" className="modal-form">
          <h2 className={clsx(styles.title)}>
            {t('permissionSettings.modal.title')}
          </h2>

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

          <div className={clsx(styles.amount)}>
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
              type="checkbox"
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              checked={this.state.canShowNotifications!}
              onChange={this.canUseNotificationsHandler}
            />
            <label htmlFor="checkbox_noshow">
              {t('notifications.allowSending')}
            </label>
          </div>

          {!inWhiteList ? (
            <div className="buttons-wrapper">
              <Button
                id="delete"
                type="button"
                onClick={this.deleteHandler}
                view="warning"
              >
                {t('permissionSettings.modal.delete')}
              </Button>

              <Button
                id="save"
                type="submit"
                view="submit"
                disabled={!this.state.canSave}
                onClick={this.saveHandler}
              >
                {t('permissionSettings.modal.save')}
              </Button>
            </div>
          ) : (
            <Button
              id="save"
              type="submit"
              view="submit"
              disabled={!this.state.canSave}
              onClick={this.saveHandler}
            >
              {t('permissionSettings.modal.save')}
            </Button>
          )}

          <Button
            id="cancel"
            className={styles.cancelBtn}
            type="button"
            view="transparent"
            onClick={this.props.onClose}
          >
            {t('permissionSettings.modal.cancel')}
          </Button>

          <Button
            className="modal-close"
            onClick={this.props.onClose}
            type="button"
            view="transparent"
          />
        </div>
      </div>
    );
  }
}

export const OriginSettings = withTranslation()(OriginSettingsComponent);

interface IProps extends WithTranslation {
  origins: Record<string, unknown[]>;
  autoSign: TAutoAuth;
  originalAutoSign: TAutoAuth;
  permissions: TPermission[];
  originName: string;
  onSave: (
    params: Partial<TAutoAuth>,
    origin: string,
    canShowNotifications: boolean | null,
  ) => void;
  onClose: () => void;
  onDelete: (origin: string) => void;
  onChangePerms: (permission: TAutoAuth) => void;
}

export type TPermission = string | TAutoAuth | TNotification;

export type TAutoAuth = {
  type: 'allowAutoSign';
  totalAmount: string | null;
  interval: number | null;
  approved?: unknown[];
};

type TNotification = {
  type: 'useNotifications';
  time: number;
  canUse: boolean;
};

interface IState {
  interval: number | null;
  totalAmount: string | null;
  canSave: boolean;
  edited: boolean;
  selected: number | string | null;
  notifications: TNotification | null;
  canShowNotifications: boolean | null;
}
