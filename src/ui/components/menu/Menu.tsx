import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from  '../head'

const Logo = ({ hasLogo }) => {
    return !hasLogo ? null : <HeadLogo/>;
};

const Settings = ({ hasSettings, leftClick, rightClick }) => {
    return !hasSettings ? null : (
        <div>
            <div className={styles.left} onClick={leftClick}>#</div>
            <div className={styles.right} onClick={rightClick}>*</div>
        </div>
    );
};

const Navigation = ({ hasBack, onClick }) => {
    return hasBack ? <div className={styles.back} onClick={onClick}>=</div> : null;
};

export const Menu = ({ setTab, ...props }: IProps) => {
        return (
            <div className={styles.menu}>
                <Logo {...props}/>
                <Settings {...props}
                    leftClick={setTab.bind(null, 'info')}
                    rightClick={setTab.bind(null, 'settings')}/>
                <Navigation hasBack={props.back != null} onClick={setTab.bind(null, props.back)}/>
            </div>
        );
};

interface IProps {
    hasLogo: boolean;
    hasSettings: boolean;
    back: string;
    setTab: (tab: string) => void;

}
