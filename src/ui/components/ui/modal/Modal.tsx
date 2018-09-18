import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as styles from './modal.styl';
import cn from 'classnames';

const ModalWrapper = (props) => {

    if (props.showChildrenOnly) {
        return props.showModal ? props.children : null;
    }

    const className = cn(styles.modal, 'modal', {
        [styles.hidden]: !props.showModal
    });

    return (
        <div className={className}>
            {props.showClose ? <div className={styles.close} onClick={props.onClose}>X</div> : null}
            <div className={styles.content}>
                {props.children}
            </div>
        </div>
    );
};


export class Modal extends React.PureComponent {
    readonly props: IProps;
    onclickOut = event => this._onClickOut(event);

    static el: HTMLDivElement;
    static modalRoot: HTMLElement;

    constructor(props: IProps) {
        super(props);
        Modal.el = Modal.el || document.createElement('div');
        Modal.modalRoot = Modal.modalRoot || document.getElementById('app-modal')
    }

    closeHandler() {
       if (this.props.onClose) {
           this.props.onClose();
       }
    }

    componentDidMount() {
        Modal.modalRoot.appendChild(Modal.el);
        this._addClickOut();
    }

    componentWillUnmount() {
        Modal.modalRoot.removeChild(Modal.el);
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
            Modal.el,
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
            if (node === Modal.el) {
                return null;
            }

            node = node.parentElement;
        }

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
