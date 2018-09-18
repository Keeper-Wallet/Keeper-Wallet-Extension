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
            <div className={styles.settingsBtn} onClick={leftClick}></div>
            <div className={styles.navigationBtn} onClick={rightClick}></div>
        </div>
    );
};

const Buttons = (props) => {
    return <div>
        {!props.deleteAccount ? null : <div className={`${styles.deleteBtn} trash-icon`} onClick={props.onDelete}>DEL</div>}
    </div>;
};

const Navigation = ({hasBack, onClick}) => {
    return hasBack ? <div className={styles.back} onClick={onClick}>=</div> : null;
};

export const Menu = ({setTab, onBack, onDelete, ...props}: IProps) => {
    const leftClick = () => setTab(PAGES.SETTINGS);
    const rightClick = () => setTab(PAGES.INFO);
    const navBack = () => onBack();
    const hasBack = props.back != null;
    return (
        <div className={`${styles.menu}`}>
            <Logo {...props}/>
            <Settings leftClick={leftClick} rightClick={rightClick} {...props}/>
            <Navigation hasBack={hasBack} onClick={navBack}/>
            <Buttons onDelete={onDelete} {...props}/>
        </div>
    );
};

interface IProps {
    hasLogo: boolean;
    hasSettings: boolean;
    back: boolean;
    deleteAccount?: boolean;
    setTab: (tab: string) => void;
    onBack: () => void;
    onDelete: () => void;

}
