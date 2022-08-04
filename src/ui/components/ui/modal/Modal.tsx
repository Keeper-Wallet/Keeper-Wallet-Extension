import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as styles from './modal.styl';
import { CSSTransition } from 'react-transition-group';

const ModalWrapper = (props: IProps) => {
  return (
    <CSSTransition
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      in={props.showModal!}
      classNames={props.animation || 'default_modal'}
      timeout={400}
      unmountOnExit
      onExited={props.onExited}
    >
      {props.children ?? <div> </div>}
    </CSSTransition>
  );
};

export class Modal extends React.PureComponent<IProps> {
  static modalRoot: HTMLElement;
  static ANIMATION = {
    FLASH: 'flash_modal',
    FLASH_SCALE: 'flash_scale_modal',
  };
  el: HTMLDivElement;

  constructor(props: IProps) {
    super(props);
    this.el = document.createElement('div');
    this.el.classList.add(styles.modalWrapper);
    Modal.modalRoot = Modal.modalRoot || document.getElementById('app-modal');
  }

  componentDidMount() {
    Modal.modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    Modal.modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      <ModalWrapper
        onExited={this.props.onExited}
        animation={this.props.animation}
        showModal={this.props.showModal}
      >
        {this.props.children}
      </ModalWrapper>,
      this.el
    );
  }
}

interface IProps {
  showModal?: boolean | null;
  children?: React.ReactNode;
  animation?: string;
  onClose?: () => void;
  onExited?: () => void;
}
