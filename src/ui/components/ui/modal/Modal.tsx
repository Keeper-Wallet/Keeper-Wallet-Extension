import { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import * as styles from './modal.styl';

const ModalWrapper = (props: Props) => {
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

interface Props {
  showModal?: boolean | null;
  children?: React.ReactNode;
  animation?: string;
  onExited?: () => void;
}

export class Modal extends PureComponent<Props> {
  static modalRoot: HTMLElement;
  static ANIMATION = {
    FLASH: 'flash_modal',
    FLASH_SCALE: 'flash_scale_modal',
  };
  el: HTMLDivElement;

  constructor(props: Props) {
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
    return createPortal(
      <ModalWrapper
        onExited={this.props.onExited}
        animation={this.props.animation}
        showModal={this.props.showModal}
      >
        {this.props.children}
      </ModalWrapper>,
      this.el,
    );
  }
}
