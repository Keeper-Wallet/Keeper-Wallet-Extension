import clsx from 'clsx';
import { Children, cloneElement, isValidElement, useState } from 'react';
import invariant from 'tiny-invariant';

import * as styles from './tabs.styl';

interface TabProps {
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
  onActivate?: () => void;
}

export function Tab({ className, children, isActive, onActivate }: TabProps) {
  return (
    <li
      className={clsx(
        styles.tabListItem,
        { [styles.tabListActive]: isActive },
        className,
      )}
      onClick={onActivate}
    >
      {children}
    </li>
  );
}

interface TabListProps {
  activeIndex?: number;
  children:
    | Array<
        | React.ReactElement<React.ComponentProps<typeof Tab>, typeof Tab>
        | boolean
        | number
        | string
        | null
        | undefined
      >
    | React.ReactElement<React.ComponentProps<typeof Tab>, typeof Tab>
    | boolean
    | number
    | string
    | null
    | undefined;
  className?: string;
  onActiveTab?: (index: number) => void;
}

export function TabList({
  activeIndex,
  children,
  className,
  onActiveTab,
}: TabListProps) {
  return (
    <ol className={clsx(styles.tabList, className)}>
      {Children.map(
        children,
        (child, index) =>
          isValidElement<React.ComponentProps<typeof Tab>>(child) &&
          cloneElement(child, {
            isActive: index === activeIndex,
            onActivate: () => onActiveTab?.(index),
          }),
      )}
    </ol>
  );
}

interface TabPanelsProps {
  activeIndex?: number;
  children: React.ReactNode;
  className?: string;
}

export function TabPanels({
  activeIndex,
  children,
  className,
}: TabPanelsProps) {
  invariant(typeof activeIndex === 'number');

  return (
    <div className={className}>{Children.toArray(children)[activeIndex]}</div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={className}>{children}</div>;
}

interface TabsProps {
  activeTab?: number | null;
  children: [React.ReactElement, React.ReactElement];
  onTabChange?: (activeIndex: number) => void;
}

export function Tabs({
  children,
  activeTab: activeTabProp,
  onTabChange,
}: TabsProps) {
  const [activeTabState, setActiveTabState] = useState(activeTabProp ?? 0);

  const activeTab = activeTabProp ?? activeTabState;

  return (
    <>
      {Children.map(children, child => {
        switch (child.type) {
          case TabPanels:
            return cloneElement(child, { activeIndex: activeTab });
          case TabList:
            return cloneElement(child, {
              activeIndex: activeTab,
              onActiveTab: (activeIndex: number) => {
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
