import * as React from 'react';
import * as styles from './index.styl';
import cn from 'classnames';

export class CollapsedContent extends React.PureComponent<IProps, IState> {
    
    readonly state = { isShowed: false };
    
    toggleHandler = () => {
        const isShowed = !this.state.isShowed;
        this.setState({ isShowed });
    };
    
    componentDidUpdate(): void {
    
        const { isShowed } = this.state;
        
        if (isShowed && this.props.onOpen) {
            this.props.onOpen();
        }
    
        if (!isShowed && this.props.onClose) {
            this.props.onClose();
        }
    }
    
    render(): React.ReactNode {
        
        const className = cn(styles.collapsed, this.props.className, { [styles.open]: this.state.isShowed });
        
        return (
            <div className={className}>
                <div className={styles.title}
                     onClick={this.toggleHandler}>
                    {this.props.titleElement}
                </div>
                {
                    this.state.isShowed ?
                        <div className={styles.content}>
                            { this.props.children }
                        </div>: null
                }
            </div>
        );
    }
    
}


interface IProps extends React.ComponentProps<'div'> {
    titleElement: string|React.ReactElement<any>;
    onOpen?: () => void;
    onClose?: () => void;
}

interface IState {
    isShowed: boolean;
}
