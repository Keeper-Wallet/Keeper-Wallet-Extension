import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as styles from './modal.styl';
import cn from 'classnames';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


const ModalWrapper = (props) => {
    let Item;
    if (props.showChildrenOnly) {
        Item = props.showModal ? <div className='modal-content'>props.children</div> : null;
    } else {

        const className = cn(styles.modal, 'modal', styles.animated, {
            [styles.hidden]: !props.showModal
        });

        Item = (
            <div className={className}>
                {props.showClose ? <div className={styles.close} onClick={props.onClose}>X</div> : null}
                <div className='modal-content'>
                    {props.children}
                </div>
            </div>
        );

    }

    const hasAnimation = !!props.animation;

    return <CSSTransitionGroup transitionName={props.animation || 'default_modal'}
                               transitionEnterTimeout={200}
                               transitionEnter={hasAnimation}
                               transitionLeaveTimeout={200}
                               transitionLeave={hasAnimation}>
        {Item}
    </CSSTransitionGroup>
};


export class Modal extends React.PureComponent {
    readonly props: IProps;
    onclickOut = event => this._onClickOut(event);

    el: HTMLDivElement;
    static modalRoot: HTMLElement;
    static ANIMATION = {
        FROM_DOWN: 'from_down_modal',
        FROM_UP: 'from_up_modal',
        FROM_LEFT: 'from_left_modal',
        FROM_RIGHT: 'from_right_modal',
        ZOOM_IN: 'zoom_in_modal',
        ZOOM_OUT: 'zoom_out_modal',
        FLASH: 'flash_modal',
        FLASH_SCALE: 'flash_scale_modal',
    };

    constructor(props: IProps) {
        super(props);
        this.el = this.el || document.createElement('div');
        this.el.classList.add(styles.modalWrapper);
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
                          animation={this.props.animation}
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
    animation?: string;
}
