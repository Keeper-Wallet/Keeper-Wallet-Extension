import * as styles from './auth.styl';
import * as React from 'react';
import cn from 'classnames';
import { withTranslation, WithTranslation } from 'react-i18next';
import { MessageCardComponentProps } from '../types';

const Icon = ({
  icon,
  canUseIcon,
  small,
}: {
  icon: string;
  canUseIcon?: boolean;
  small?: boolean;
}) => (
  <div className={small ? styles.authTxIconSmall : styles.authTxIcon}>
    {canUseIcon ? (
      <img
        className={small ? styles.authTxIconSmall : styles.authTxIcon}
        src={icon}
      />
    ) : (
      <div
        className={cn('signin-icon', {
          [styles.authTxIcon]: !small,
          [styles.authTxIconSmall]: small,
          [styles.iconMargin]: !small,
        })}
      />
    )}
  </div>
);

interface State {
  canUseIcon: boolean;
  icon: string | null;
}

class AuthCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation,
  State
> {
  readonly state: State = { canUseIcon: false, icon: null };

  componentDidMount(): void {
    const { message } = this.props;
    const { data, origin } = message;
    const tx = data.data;
    let icon: string | null;

    try {
      icon = new URL(tx.icon, data.referrer || `https://${origin}`).href;
    } catch (e) {
      icon = null;
    }

    const img = document.createElement('img');
    img.onload = () => this.setState({ icon, canUseIcon: true });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    img.src = icon!;
  }

  render() {
    const { canUseIcon, icon } = this.state;
    const { t, message, collapsed } = this.props;
    const { data, origin } = message;
    const tx = { type: data.type, ...data.data };
    const { name } = tx;
    const className = cn(styles.authTransactionCard, this.props.className, {
      [styles.authCardCollapsed]: this.props.collapsed,
    });

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          {collapsed ? (
            <React.Fragment>
              <div className={styles.smallCardContent}>
                <div>
                  <Icon
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    icon={icon!}
                    canUseIcon={canUseIcon}
                    small={true}
                  />
                </div>
                <div>
                  <div className="basic500 body3 margin-min origin-ellipsis">
                    {name || origin}
                  </div>
                  <h1 className="headline1">
                    {t('transactions.allowAccessTitle')}
                  </h1>
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div>
              <Icon
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                icon={icon!}
                canUseIcon={canUseIcon}
              />
              <div>
                <div className="body1 font600 margin-min">{name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const AuthCard = withTranslation()(AuthCardComponent);
