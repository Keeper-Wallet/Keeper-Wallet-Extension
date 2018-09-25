import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as styles from './modal.styl';
import cn from 'classnames';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


const ModalWrapper = (props) => {
    let Item;
    if (props.showChildrenOnly) {
        Item = props.showModal ? props.children : null;
    } else {

        const className = cn(styles.modal, 'modal', styles.animated, {
            [styles.hidden]: !props.showModal
        });

        Item = (
            <div className={className}>
                {props.showClose ? <div className={styles.close} onClick={props.onClose}>X</div> : null}
                <div className={styles.content}>
                    {props.children}
                </div>
            </div>
        );

    }
    return <CSSTransitionGroup transitionName="animated_modal"
                               transitionEnterTimeout={200}
                               transitionEnter={true}
                               transitionLeaveTimeout={200}
                               transitionLeave={true}>
        {Item}
    </CSSTransitionGroup>
};


export class Modal extends React.PureComponent {
    readonly props: IProps;
    onclickOut = event => this._onClickOut(event);

    el: HTMLDivElement;
    static modalRoot: HTMLElement;

    constructor(props: IProps) {
        super(props);
        this.el = this.el || document.createElement('div');
        Modal.modalRoot = Modal.modalRoot || document.getElementById('app-modal')
    }

    closeHandler() {
       if (this.props.onClose) {
           this.props.onClose();
       }
    }

    componentDidMount() {
        Modal.modalRoot.appendChild(this.el);
        this._addClickOut();
    }

    componentWillUnmount() {
        Modal.modalRoot.removeChild(this.el);
        document.removeEventListener('click', this.onclickOut);
    }

    render() {
        return ReactDOM.createPortal(
            <ModalWrapper onClose={this.closeHandler.bind(this)}
                          showClose={this.props.showClose}
                          showModal={this.props.showModal}
                          showChildrenOnly={this.props.showChildrenOnly}>
                {this.props.children}
            </ModalWrapper>,
            this.el,
        );
    }

    private _addClickOut() {
        if (this.props.noClickOut) {
            return null;
        }

        document.addEventListener('click', this.onclickOut);
    }

    private _onClickOut(event) {
        if (!this.props.showModal) {
            return null;
        }

        let node = event.target;

        while (node) {
            if (node === this.el) {
                return null;
            }

            node = node.parentElement;
        }
        event.stopPropagation();
        event.preventDefault();
        this.closeHandler();
    }
}


interface IProps {
    showModal?: boolean;
    showClose?: boolean;
    showChildrenOnly?: boolean;
    noClickOut?: boolean;
    children?: any;
    onClose?: () => void;
}
