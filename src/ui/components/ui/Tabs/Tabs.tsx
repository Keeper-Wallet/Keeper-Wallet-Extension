import * as styles from './tabs.styl';
import * as React from 'react';
import cn from 'classnames';

interface TabProps {
  children: React.ReactNode;
  isActive?: boolean;
  onActivate?: () => void;
}

export function Tab({ children, isActive, onActivate }: TabProps) {
  return (
    <li
      className={cn(styles.tabListItem, { [styles.tabListActive]: isActive })}
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
  children: [React.ReactElement, React.ReactElement];
}

export function Tabs({ children }: TabsProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <>
      {React.Children.map(children, child => {
        switch (child.type) {
          case TabPanels:
            return React.cloneElement(child, { activeIndex: activeIndex });
          case TabList:
            return React.cloneElement(child, {
              activeIndex: activeIndex,
              onActiveTab: activeIndex => {
                setActiveIndex(activeIndex);
              },
            });
          default:
            return child;
        }
      })}
    </>
  );
}
