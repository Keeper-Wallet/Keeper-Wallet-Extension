import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from '../head';
import { PAGES } from '../../pageConfig';

const Logo = ({ hasLogo }: { hasLogo: boolean }) => {
  return !hasLogo ? null : <HeadLogo />;
};

const Settings = ({
  hasSettings,
  leftClick,
  rightClick,
}: {
  hasSettings: boolean;
  leftClick: (event: React.MouseEvent<HTMLElement>) => void;
  rightClick: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return !hasSettings ? null : (
    <div>
      <div className={styles.settingsIcon} onClick={leftClick} />
      <div className={styles.navigationIcon} onClick={rightClick} />
    </div>
  );
};

const Buttons = ({
  deleteAccount,
  onDelete,
}: {
  deleteAccount: boolean;
  onDelete: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <div>
      {!deleteAccount ? null : (
        <div
          className={`${styles.deleteIcon} delete-icon`}
          onClick={onDelete}
        />
      )}
    </div>
  );
};

const Back = ({
  hasBack,
  onClick,
}: {
  hasBack: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return hasBack ? (
    <div
      className={`${styles.arrowBackIcon} arrow-back-icon`}
      onClick={onClick}
    />
  ) : null;
};

const Close = ({
  hasClose,
  onClick,
}: {
  hasClose: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  return hasClose ? (
    <div className={`${styles.closeIcon} close-icon`} onClick={onClick} />
  ) : null;
};

export const Menu = ({
  setTab,
  onBack,
  hasClose = false,
  hasBack = false,
  onDelete,
  ...props
}: IProps) => {
  const leftClick = () => setTab(PAGES.SETTINGS);
  const rightClick = () => setTab(PAGES.INFO);
  const navBack = () => onBack();

  return (
    <div>
      <Logo {...props} />
      <Settings leftClick={leftClick} rightClick={rightClick} {...props} />
      <Back hasBack={hasBack} onClick={navBack} />
      <Close hasClose={hasClose} onClick={navBack} />
      <Buttons onDelete={onDelete} {...props} />
    </div>
  );
};

interface IProps {
  hasLogo: boolean;
  hasSettings: boolean;
  hasBack: boolean;
  hasClose: boolean;
  deleteAccount: boolean;
  setTab: (tab: string) => void;
  onBack: () => void;
  onDelete: () => void;
}
