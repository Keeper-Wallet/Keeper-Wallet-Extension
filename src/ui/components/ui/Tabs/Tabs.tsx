import * as styles from './tabs.styl';
import * as React from 'react';
import cn from 'classnames';

interface ITabProps {
    children: React.ReactNode;
    isActive?: boolean;
    onActivate?: () => void;
}

export function Tab({ children, isActive, onActivate }: ITabProps) {
    return (
        <li className={cn(styles.tabListItem, { [styles.tabListActive]: isActive })} onClick={onActivate}>
            {children}
        </li>
    );
}

interface ITabListProps {
    children: React.ReactElement[];
    activeIndex?: number;
    onActiveTab?: (index) => void;
    className?: string;
}

export function TabList({ children, activeIndex, onActiveTab, className }: ITabListProps) {
    return (
        <ol className={cn(styles.tabList, className)}>
            {React.Children.map(children, (child, index) =>
                React.cloneElement(child, { isActive: index == activeIndex, onActivate: () => onActiveTab(index) })
            )}
        </ol>
    );
}

interface ITabPanelsProps {
    children: React.ReactElement[];
    activeIndex?: number;
}

export function TabPanels({ children, activeIndex }: ITabPanelsProps) {
    return <div className={styles.tabPanels}>{children[activeIndex]}</div>;
}

export function TabPanel({ children }) {
    return <div className={styles.tabPanel}>{children}</div>;
}

export function Tabs({ children }) {
    const [activeIndex, setActiveIndex] = React.useState(0);

    return React.Children.map(children, (child) => {
        if (child.type == TabPanels) {
            return React.cloneElement(child, { activeIndex: activeIndex });
        } else if (child.type == TabList) {
            return React.cloneElement(child, {
                activeIndex: activeIndex,
                onActiveTab: (activeIndex) => {
                    setActiveIndex(activeIndex);
                },
            });
        } else {
            return child;
        }
    });
}
