import * as styles from './tabs.styl';
import * as React from 'react';
import cn from 'classnames';

interface TabProps {
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
  onActivate?: () => void;
}

export function Tab({ className, children, isActive, onActivate }: TabProps) {
  return (
    <li
      className={cn(
        styles.tabListItem,
        { [styles.tabListActive]: isActive },
        className
      )}
      onClick={onActivate}
    >
      {children}
    </li>
  );
}

interface TabListProps {
  activeIndex?: number;
  children: React.ReactElement | React.ReactElement[];
  className?: string;
  onActiveTab?: (index) => void;
}

export function TabList({
  activeIndex,
  children,
  className,
  onActiveTab,
}: TabListProps) {
  return (
    <ol className={cn(styles.tabList, className)}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isActive: index == activeIndex,
          onActivate: () => onActiveTab(index),
        })
      )}
    </ol>
  );
}

interface TabPanelsProps {
  activeIndex?: number;
  children: React.ReactElement | React.ReactElement[];
  className?: string;
}

export function TabPanels({
  activeIndex,
  children,
  className,
}: TabPanelsProps) {
  const childArray = React.Children.toArray(children);

  return <div className={className}>{childArray[activeIndex]}</div>;
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={className}>{children}</div>;
}

interface TabsProps {
  activeTab?: number;
  children: [React.ReactElement, React.ReactElement];
  onTabChange?: (activeIndex) => void;
}

export function Tabs({
  children,
  activeTab: activeTabProp,
  onTabChange,
}: TabsProps) {
  const [activeTabState, setActiveTabState] = React.useState(
    activeTabProp ?? 0
  );

  const activeTab = activeTabProp ?? activeTabState;

  return (
    <>
      {React.Children.map(children, child => {
        switch (child.type) {
          case TabPanels:
            return React.cloneElement(child, { activeIndex: activeTab });
          case TabList:
            return React.cloneElement(child, {
              activeIndex: activeTab,
              onActiveTab: activeIndex => {
                if (onTabChange) {
                  onTabChange(activeIndex);
                }
                setActiveTabState(activeIndex);
              },
            });
          default:
            return child;
        }
      })}
    </>
  );
}
