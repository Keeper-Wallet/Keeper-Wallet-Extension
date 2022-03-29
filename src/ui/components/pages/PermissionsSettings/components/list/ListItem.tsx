import * as React from 'react';
import cn from 'classnames';
import { Button, ButtonType, ButtonView } from 'ui/components/ui/buttons';
import * as styles from './list.styl';

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

const ItemButton: React.FunctionComponent<any> = ({ permissions, onClick }) => {
  if (permissions.includes('whiteList')) {
    return <Icon />;
  }
  const isApproved = permissions.includes('approved');
  const status = isApproved ? 'enable' : 'disable';
  const className = cn(styles.button, styles[status]);
  return (
    <Button
      type={ButtonType.BUTTON}
      view={ButtonView.TRANSPARENT}
      onClick={() => onClick(!isApproved)}
      className={className}
    />
  );
};

const Icon = () => <div className={cn(styles.icon, styles.button)} />;

const SettingsButton: React.FunctionComponent<any> = props => {
  return (
    <Button
      type={ButtonType.BUTTON}
      view={ButtonView.TRANSPARENT}
      onClick={props.onClick}
      className={cn(styles.button, styles.settings)}
    />
  );
};

interface IParams extends React.ComponentProps<'div'> {
  originName: string;
  permissions: any;
  permissionsText: any;
  showSettings: (origin: string) => void;
  toggleApprove: (origin: string, enable: boolean) => void;
}
