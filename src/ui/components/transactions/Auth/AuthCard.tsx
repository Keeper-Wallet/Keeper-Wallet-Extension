import * as styles from './auth.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';

const Icon = props => (
  <div className={props.small ? styles.authTxIconSmall : styles.authTxIcon}>
    {props.canUseIcon ? (
      <img
        className={props.small ? styles.authTxIconSmall : styles.authTxIcon}
        src={props.icon}
      />
    ) : (
      <div
        className={cn('signin-icon', {
          [styles.authTxIcon]: !props.small,
          [styles.authTxIconSmall]: props.small,
          [styles.iconMargin]: !props.small,
        })}
      />
    )}
  </div>
);

interface IProps {
  className: string;
  collapsed: boolean;
  message: any;
}

export class AuthCard extends React.PureComponent<IProps> {
  readonly state = { canUseIcon: false, icon: null };

  componentDidMount(): void {
    const { message } = this.props;
    const { data, origin } = message;
    const tx = data.data;
    let icon;

    try {
      icon = new URL(tx.icon, data.referrer || `https://${origin}`).href;
    } catch (e) {
      icon = null;
    }

    const img = document.createElement('img');
    img.onload = () => this.setState({ icon, canUseIcon: true });
    img.src = icon;
  }

  render() {
    const { canUseIcon, icon } = this.state;
    const { message, collapsed } = this.props;
    const { data, origin } = message;
    const tx = { type: data.type, ...data.data };
    const { name } = tx;
    const className = cn(styles.authTransactionCard, this.props.className, {
      [styles.authCard_collapsed]: this.props.collapsed,
    });

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          {collapsed ? (
            <React.Fragment>
              <div className={styles.smallCardContent}>
                <div className={styles.originAuthTxIconSmall}>
                  <Icon icon={icon} canUseIcon={canUseIcon} small={true} />
                </div>
                <div>
                  <div className="basic500 body3 margin-min origin-ellipsis">
                    {name || origin}
                  </div>
                  <h1 className="headline1">
                    <Trans i18nKey="transactions.allowAccessTitle" />
                  </h1>
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className={styles.originAuthTxIcon}>
              <Icon icon={icon} canUseIcon={canUseIcon} />
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
