import * as styles from './plate.styl';
import * as React from 'react';
import cn from 'classnames';
import { withTranslation, WithTranslation } from 'react-i18next';
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

interface IPlateCollapsableProps extends WithTranslation {
  className?: string;
  showExpand?: boolean;
  showCopy?: boolean;
  children?: React.ReactNode;
}

interface IPlateCollapsableState {
  isExpanded: boolean;
  showExpand: boolean | undefined;
  isCopied: boolean;
}

class PlateCollapsableComponent extends React.PureComponent<
  IPlateCollapsableProps,
  IPlateCollapsableState
> {
  state = { showExpand: false, isExpanded: false, isCopied: false };
  childrenEl: HTMLDivElement | null | undefined;
  resizeObserver: ResizeObserver | undefined;
  _t: ReturnType<typeof setTimeout> | undefined;

  getChildrenRef = (ref: HTMLDivElement | null) => (this.childrenEl = ref);

  toggleExpand = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  };

  onCopy = () => {
    this.setState({ isCopied: true });

    if (this._t != null) {
      clearTimeout(this._t);
    }

    this._t = setTimeout(() => this.setState({ isCopied: false }), 1000);
  };

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.setState({
          showExpand:
            this.props.showExpand &&
            (this.state.isExpanded ||
              (!this.state.isExpanded &&
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                entry.target.scrollHeight > this.childrenEl!.offsetHeight)),
        });
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.resizeObserver.observe(this.childrenEl!);
  }

  componentWillUnmount() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.resizeObserver!.disconnect();
  }

  render() {
    const { showExpand, isExpanded, isCopied } = this.state;
    const { t, className, children, showCopy } = this.props;
    const classNames = cn(className, { [styles.expanded]: isExpanded });
    const textToCopy = (
      React.Children.only(children) as React.ReactElement<{ data: unknown }>
    ).props?.data;

    return (
      <Plate className={classNames}>
        <div ref={this.getChildrenRef}>{children}</div>

        <div className="buttons-wrapper">
          {showCopy && (
            <Copy text={textToCopy as string} onCopy={this.onCopy}>
              <Button type="button">{t('plateComponent.copy')}</Button>
            </Copy>
          )}

          {showExpand && (
            <Button onClick={this.toggleExpand} type="button">
              {t(
                isExpanded ? 'plateComponent.collapse' : 'plateComponent.expand'
              )}
            </Button>
          )}
        </div>

        {showCopy && (
          <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={isCopied}>
            <div className="modal notification">
              {t('plateComponent.copied')}
            </div>
          </Modal>
        )}
      </Plate>
    );
  }
}

export const PlateCollapsable = withTranslation()(PlateCollapsableComponent);
