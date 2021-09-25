import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as styles from './modal.styl';
import { CSSTransition } from 'react-transition-group';

const ModalWrapper = (props) => {
    return (
        <CSSTransition in={props.showModal} classNames={props.animation || 'default_modal'} timeout={400} unmountOnExit>
            {props.showChildrenOnly ? (
                <div className="modal">
                    {props.showClose && (
                        <div className={styles.close} onClick={props.onClose}>
                            X
                        </div>
                    )}
                    <div className="modal-content">{props.children}</div>
                </div>
            ) : (
                props.children ?? <div> </div>
            )}
        </CSSTransition>
    );
};

export class Modal extends React.PureComponent {
    static modalRoot: HTMLElement;
    static ANIMATION = {
        FLASH: 'flash_modal',
        FLASH_SCALE: 'flash_scale_modal',
    };
    readonly props: IProps;
    el: HTMLDivElement;

    constructor(props: IProps) {
        super(props);
        this.el = this.el || document.createElement('div');
        this.el.classList.add(styles.modalWrapper);
        Modal.modalRoot = Modal.modalRoot || document.getElementById('app-modal');
    }

    onclickOut = (event) => this._onClickOut(event);

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
            <ModalWrapper
                onClose={this.closeHandler.bind(this)}
                animation={this.props.animation}
                showClose={this.props.showClose}
                showModal={this.props.showModal}
                showChildrenOnly={this.props.showChildrenOnly}
            >
                {this.props.children}
            </ModalWrapper>,
            this.el
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
    animation?: string;
}
