import * as styles from './plate.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';
import { Button } from '../buttons';

export const Plate = ({ className, children }: IProps) => {
    return <div className={cn('plate', 'plate-with-controls', 'break-all', className)}>{children}</div>;
};

export class PlateCollapsed extends React.PureComponent<IProps, IState> {
    childrenEl: HTMLDivElement;

    state = { showExpand: false, isExpanded: false };

    getChildrenRef = (ref) => (this.childrenEl = ref);

    toggleExpand = () => {
        this.setState({ isExpanded: !this.state.isExpanded });
    };

    componentDidMount() {
        this.setState({
            showExpand: this.props.showExpand && this.childrenEl.scrollHeight > this.childrenEl.offsetHeight,
        });
    }

    render() {
        const { showExpand, isExpanded } = this.state;
        const { className, children } = this.props;
        const classNames = cn(className, { [styles.expanded]: isExpanded });

        return (
            <Plate className={classNames}>
                <div ref={this.getChildrenRef}>{children}</div>

                <div className="buttons-wrapper">
                    {showExpand ? (
                        <Button onClick={this.toggleExpand}>
                            <Trans i18nKey={isExpanded ? 'plateComponent.collapse' : 'plateComponent.expand'} />
                        </Button>
                    ) : null}
                </div>
            </Plate>
        );
    }
}

interface IProps {
    className?: string;
    children?: any;
    showExpand?: boolean;
}

interface IState {
    showExpand: boolean;
    isExpanded: boolean;
}
