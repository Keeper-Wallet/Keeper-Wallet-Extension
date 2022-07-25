import * as React from 'react';
import cn from 'classnames';
import { Button } from 'ui/components/ui/buttons';
import * as styles from './list.styl';
import { IAutoAuth } from 'ui/components/pages/PermissionsSettings/PermissionSettings';

export const ListItem: React.FunctionComponent<IParams> = ({
  className,
  originName,
  permissions,
  showSettings,
  toggleApprove,
  permissionsText,
}) => (
  <div
    className={cn(className, styles.permissionItem, {
      [styles.approved]: permissions.includes('approved'),
    })}
  >
    <div>{originName}</div>
    <div className={styles.statusColor}>{permissionsText}</div>
    <div>
      <ItemButton
        permissions={permissions}
        onClick={enable => toggleApprove(originName, enable)}
      />
      <SettingsButton onClick={() => showSettings(originName)} />
    </div>
  </div>
);

const ItemButton: React.FunctionComponent<{
  permissions: Array<string | IAutoAuth>;
  onClick: (enable: boolean) => void;
}> = ({ permissions, onClick }) => {
  if (permissions.includes('whiteList')) {
    return <Icon />;
  }
  const isApproved = permissions.includes('approved');
  const status = isApproved ? 'enable' : 'disable';
  const className = cn(styles.button, styles[status]);
  return (
    <Button
      type="button"
      view="transparent"
      onClick={() => onClick(!isApproved)}
      className={className}
    />
  );
};

const Icon = () => <div className={cn(styles.icon, styles.button)} />;

const SettingsButton: React.FunctionComponent<{
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = props => {
  return (
    <Button
      type="button"
      view="transparent"
      onClick={props.onClick}
      className={cn(styles.button, styles.settings)}
    />
  );
};

interface IParams extends React.ComponentProps<'div'> {
  originName: string;
  permissions: Array<string | IAutoAuth>;
  permissionsText: React.ReactElement;
  showSettings: (origin: string) => void;
  toggleApprove: (origin: string, enable: boolean) => void;
}
