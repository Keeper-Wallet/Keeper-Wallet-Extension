import * as React from 'react';
import * as styles from './tabs.styl';
import cn from 'classnames';
import { Trans } from 'react-i18next';

class Tab extends React.PureComponent<ITabProps> {
    onClick = () => {
        const { label, onClick } = this.props;
        onClick(label);
    };

    render() {
        const {
            onClick,
            props: { activeTab, label },
        } = this;

        return (
            <li className={cn(styles.tabListItem, { [styles.tabListActive]: activeTab === label })} onClick={onClick}>
                <Trans i18nKey={label}>{label}</Trans>
            </li>
        );
    }
}

interface ITabProps {
    activeTab: string;
    label: string;
    onClick: (tab) => void;
}

export class Tabs extends React.PureComponent<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: this.props.children[0].props['data-label'],
        };
    }

    onClickTabItem = (tab) => {
        this.setState({ activeTab: tab });
    };

    render() {
        const {
            onClickTabItem,
            props: { children },
            state: { activeTab },
        } = this;

        return (
            <div className={styles.tabs}>
                <ol className={styles.tabList}>
                    {children.map((child) => {
                        const label = child.props['data-label'];
                        return <Tab activeTab={activeTab} key={label} label={label} onClick={onClickTabItem} />;
                    })}
                </ol>
                <div className={styles.tabContent}>
                    {children.map((child) => {
                        if (child.props['data-label'] !== activeTab) return undefined;
                        return child.props.children;
                    })}
                </div>
            </div>
        );
    }
}

interface IProps {
    children?: any[];
}

interface IState {
    activeTab: string;
}
