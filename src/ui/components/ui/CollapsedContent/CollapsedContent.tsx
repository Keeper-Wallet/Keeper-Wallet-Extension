import * as React from 'react';
import styles from './index.styl';
import cn from 'classnames';

export class CollapsedContent extends React.PureComponent<IProps, IState> {
  readonly state = { isShowed: false };

  myRef: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.myRef = React.createRef<HTMLDivElement>();
  }

  toggleHandler = () => {
    const isShowed = !this.state.isShowed;
    this.setState({ isShowed });
  };

  componentDidUpdate(): void {
    const { isShowed } = this.state;

    if (isShowed && this.props.scrollElement) {
      this.scrollToMyRef();
    }

    if (isShowed && this.props.onOpen) {
      this.props.onOpen();
    }

    if (!isShowed && this.props.onClose) {
      this.props.onClose();
    }
  }

  render(): React.ReactNode {
    const className = cn(styles.collapsed, this.props.className, {
      [styles.open]: this.state.isShowed,
    });

    return (
      <div className={className} ref={this.myRef}>
        <div className={styles.title} onClick={this.toggleHandler}>
          {this.props.titleElement}
        </div>
        {this.state.isShowed ? (
          <div className={styles.content}>{this.props.children}</div>
        ) : null}
      </div>
    );
  }

  scrollToMyRef = () =>
    window.setTimeout(() => {
      if (this.myRef.current == null) {
        return;
      }

      this.props.scrollElement.scrollTo({
        top: this.myRef.current.offsetTop,
        behavior: 'smooth',
      });
    }, 0);
}

interface IProps extends React.ComponentProps<'div'> {
  scrollElement: HTMLElement;
  titleElement: string | React.ReactElement;
  onOpen?: () => void;
  onClose?: () => void;
}

interface IState {
  isShowed: boolean;
}
