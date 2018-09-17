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
            <div className={styles.left} onClick={leftClick}>#</div>
            <div className={styles.right} onClick={rightClick}>*</div>
        </div>
    );
};

const Navigation = ({hasBack, onClick}) => {
    return hasBack ? <div className={styles.back} onClick={onClick}>=</div> : null;
};

export const Menu = ({setTab, ...props}: IProps) => {
    const leftClick = () => setTab(PAGES.INFO);
    const rightClick = () => setTab(PAGES.SETTINGS);
    const navBack = () => setTab(props.back);
    const hasBack = props.back != null;
    return (
        <div className={styles.menu}>
            <Logo {...props}/>
            <Settings leftClick={leftClick} rightClick={rightClick} {...props}/>
            <Navigation hasBack={hasBack} onClick={navBack}/>
        </div>
    );
};

interface IProps {
    hasLogo: boolean;
    hasSettings: boolean;
    back: string;
    setTab: (tab: string) => void;

}
