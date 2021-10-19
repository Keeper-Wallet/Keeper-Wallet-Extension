import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from '../head';
import { PAGES } from '../../pageConfig';

const Logo = ({hasLogo}) => {
    return !hasLogo ? null : <HeadLogo/>;
};

const Settings = ({hasSettings, leftClick, rightClick}) => {
    return !hasSettings ? null : (
        <div>
            <div className={styles.settingsIcon} onClick={leftClick}></div>
            <div className={styles.navigationIcon} onClick={rightClick}></div>
        </div>
    );
};

const Buttons = (props) => {
    return <div>
        {!props.deleteAccount ? null : <div className={`${styles.deleteIcon} delete-icon`} onClick={props.onDelete}></div>}
    </div>;
};

const Back = ({ hasBack, onClick }) => {
    return hasBack ? <div className={`${styles.arrowBackIcon} arrow-back-icon`} onClick={onClick}></div> : null;
};

const Close = ({ hasClose, onClick }) => {
    return hasClose ? <div className={`${styles.closeIcon} close-icon`} onClick={onClick}></div> : null;
};

export const Menu = ({setTab, onBack, hasClose=false, hasBack=false, onDelete, ...props}: IProps) => {
    const leftClick = () => setTab(PAGES.SETTINGS);
    const rightClick = () => setTab(PAGES.INFO);
    const navBack = () => onBack();

    return (
        <div>
            <Logo {...props}/>
            <Settings leftClick={leftClick} rightClick={rightClick} {...props}/>
            <Back hasBack={hasBack} onClick={navBack}/>
            <Close hasClose={hasClose} onClick={navBack}/>
            <Buttons onDelete={onDelete} {...props}/>
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
