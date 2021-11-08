import * as styles from './plate.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';
import { Button } from '../buttons';
import { Copy } from '../copy';
import { Modal } from '../modal/Modal';

interface IPlateProps {
  className?: string;
}

export const Plate = ({
  className,
  children,
}: React.PropsWithChildren<IPlateProps>) => {
  return (
    <div className={cn('plate', 'plate-with-controls', 'break-all', className)}>
      {children}
    </div>
  );
};

interface IPlateCollapsableProps {
  className?: string;
  showExpand?: boolean;
  showCopy?: boolean;
  children?: React.ReactNode;
}

interface IPlateCollapsableState {
  isExpanded: boolean;
  showExpand: boolean;
  isCopied: boolean;
}

export class PlateCollapsable extends React.PureComponent<
  IPlateCollapsableProps,
  IPlateCollapsableState
> {
  state = { showExpand: false, isExpanded: false, isCopied: false };
  childrenEl: HTMLDivElement;
  resizeObserver: ResizeObserver;
  _t;

  getChildrenRef = ref => (this.childrenEl = ref);

  toggleExpand = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  };

  onCopy = () => {
    this.setState({ isCopied: true });
    clearTimeout(this._t);
    this._t = setTimeout(() => this.setState({ isCopied: false }), 1000);
  };

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.setState({
          showExpand:
            this.props.showExpand &&
            (this.state.isExpanded ||
              (!this.state.isExpanded &&
                entry.target.scrollHeight > this.childrenEl.offsetHeight)),
        });
      }
    });

    this.resizeObserver.observe(this.childrenEl);
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  render() {
    const { showExpand, isExpanded, isCopied } = this.state;
    const { className, children, showCopy } = this.props;
    const classNames = cn(className, { [styles.expanded]: isExpanded });
    const textToCopy = (
      React.Children.only(children) as React.ReactElement<{ data: any }>
    ).props?.data;

    return (
      <Plate className={classNames}>
        <div ref={this.getChildrenRef}>{children}</div>

        <div className="buttons-wrapper">
          {showCopy && (
            <Copy text={textToCopy} onCopy={this.onCopy}>
              <Button>
                <Trans i18nKey="plateComponent.copy" />
              </Button>
            </Copy>
          )}

          {showExpand && (
            <Button onClick={this.toggleExpand}>
              <Trans
                i18nKey={
                  isExpanded
                    ? 'plateComponent.collapse'
                    : 'plateComponent.expand'
                }
              />
            </Button>
          )}
        </div>

        {showCopy && (
          <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={isCopied}>
            <div className="modal notification">
              <Trans i18nKey="plateComponent.copied" />
            </div>
          </Modal>
        )}
      </Plate>
    );
  }
}
