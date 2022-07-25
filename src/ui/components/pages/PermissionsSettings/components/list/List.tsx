import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ListItem } from './ListItem';
import * as styles from './list.styl';
import {
  IAutoAuth,
  TTabTypes,
} from 'ui/components/pages/PermissionsSettings/PermissionSettings';

class ListComponent extends React.PureComponent<IProps> {
  render(): React.ReactNode {
    const { t, origins, showType, showSettings, toggleApprove } = this.props;
    const originsNames = Object.keys(getFilteredOrigins(origins, showType));

    if (originsNames.length === 0) {
      return (
        <div className={styles.emptyBlock}>
          <div className={styles.icon} />
          <div className="body3 margin-main-top basic500 center">
            {t('permissionsSettings.empty')}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.permissionList}>
        {originsNames.sort().map(name => (
          <ListItem
            key={name}
            originName={name}
            permissions={origins[name]}
            permissionsText={this.getPermissionsText(t, origins[name])}
            showSettings={showSettings}
            toggleApprove={toggleApprove}
          />
        ))}
      </div>
    );
  }

  getPermissionsText(t, perms) {
    let hasApproved = false;
    let hasAuto = false;

    if (perms.length) {
      hasApproved = perms.includes('approved');
      hasAuto =
        hasApproved &&
        perms.find(item =>
          typeof item !== 'object' ? false : item.type === 'allowAutoSign'
        );
    }

    return (
      <React.Fragment>
        {t(
          hasApproved
            ? 'permissionsSettings.approvedOrigin'
            : 'permissionsSettings.rejectedOrigin'
        )}
        {hasAuto ? (
          <span>{t('permissionsSettings.automaticOrigin')}</span>
        ) : null}
      </React.Fragment>
    );
  }
}

const getFilteredOrigins = (
  origins: Record<string, Array<string | IAutoAuth>>,
  attr: TTabTypes
) => {
  return Object.keys(origins)
    .filter(name => {
      const permissions = origins[name] || [];

      if (attr !== 'customList') {
        return permissions.includes(attr);
      }

      return (
        !permissions.includes('whiteList') && !permissions.includes('blackList')
      );
    })
    .reduce((acc, name) => {
      acc[name] = origins[name] || [];
      return acc;
    }, Object.create(null));
};

interface IProps extends WithTranslation {
  origins: Record<string, Array<string | IAutoAuth>>;
  showType: TTabTypes;
  showSettings: (origin: string) => void;
  toggleApprove: (origin: string, enable: boolean) => void;
}

export const List = withTranslation()(ListComponent);
