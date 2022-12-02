import clsx from 'clsx';
import { createRef, PureComponent } from 'react';

import * as styles from './index.styl';

export class CollapsedContent extends PureComponent<IProps, IState> {
  readonly state = { isShowed: false };

  myRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProps) {
    super(props);
    this.myRef = createRef<HTMLDivElement>();
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
    const className = clsx(styles.collapsed, this.props.className, {
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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.props.scrollElement!.scrollTo({
        top: this.myRef.current.offsetTop,
        behavior: 'smooth',
      });
    }, 0);
}

interface IProps extends React.ComponentProps<'div'> {
  scrollElement: HTMLElement | null | undefined;
  titleElement: string | React.ReactElement;
  onOpen?: () => void;
  onClose?: () => void;
}

interface IState {
  isShowed: boolean;
}
