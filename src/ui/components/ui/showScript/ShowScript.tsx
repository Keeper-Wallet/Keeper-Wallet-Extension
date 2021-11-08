import * as styles from './script.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { Copy } from '../copy';
import { Button } from '../buttons';
import { Modal } from '..';

const ContentScript = ({ script, getScriptRef }) => (
  <pre ref={getScriptRef} className={cn(styles.codeScript, 'body3')}>
    {script}
  </pre>
);

const Data = ({ data, getScriptRef }) => {
  return (
    <div className={styles.dataContainer} ref={getScriptRef}>
      <table className={cn(styles.data, styles.dataTable)}>
        <thead>
          <tr className={cn('basic500', styles.headRow)}>
            <td className={styles.dataItemData}>Key</td>
            <td className={styles.dataItemData}>Type</td>
            <td className={styles.dataItemData}>Value</td>
          </tr>
        </thead>
        {(data || []).map((item, index) => {
          return (
            <tbody key={index}>
              <tr className={cn(styles.dataRow)}>
                <td title={item.key} className={styles.dataItemData}>
                  {item.key}
                </td>
                <td title={item.type} className={styles.dataItemData}>
                  {item.type}
                </td>
                <td
                  title={String(item.value)}
                  className={styles.dataItemDataLast}
                >
                  {!!item.value ? item.value : 'Key Deletion'}
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
};

const DataNoKey = ({ data, getScriptRef }) => {
  return (
    <div className={styles.dataContainer} ref={getScriptRef}>
      <table className={cn(styles.data, styles.dataTable)}>
        <thead>
          <tr className={cn('basic500', styles.headRow)}>
            <td className={styles.dataItemData}>Type</td>
            <td className={styles.dataItemDataLast}>Value</td>
          </tr>
        </thead>
        {(data || []).map((item, index) => {
          const itemValue = item.value;
          const itemValueJson = JSON.stringify(item.value);
          const length = Array.isArray(itemValue) ? itemValue.length : 0;
          return (
            <tbody key={index}>
              <tr className={cn(styles.dataRow)}>
                <td className={styles.dataItemData}>{item.type}</td>
                {!!length ? (
                  <td title={itemValueJson} className={styles.dataItemDataLast}>
                    [
                    {itemValue.map((item, index) =>
                      index === length - 1 ? (
                        <>
                          {JSON.stringify(item)}]<br />
                        </>
                      ) : (
                        <>
                          {JSON.stringify(item)},<br />
                        </>
                      )
                    )}
                  </td>
                ) : (
                  <td title={itemValueJson} className={styles.dataItemDataLast}>
                    {itemValueJson}
                  </td>
                )}
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
};

export class ShowScript extends React.PureComponent {
  readonly props: {
    noKey?: boolean;
    data?: Array<any>;
    isData?: boolean;
    script?: string;
    optional?: boolean;
    showNotify?: boolean;
    className?: string;
    hideScript?: boolean;
  };
  readonly state = {
    showAllScript: false,
    showCopied: false,
    showResizeBtn: false,
  };
  protected scriptEl: HTMLDivElement;
  protected _t;

  toggleShowScript = () =>
    this.setState({ showAllScript: !this.state.showAllScript });
  onCopy = () => this._onCopy();
  getScriptRef = ref => (this.scriptEl = ref);

  componentDidMount() {
    const { script, optional, hideScript, data } = this.props;

    if (
      !this.scriptEl ||
      hideScript ||
      (optional && !(script || (data && data.length)))
    ) {
      return null;
    }

    const scrollHeight = this.scriptEl.scrollHeight;
    const height = this.scriptEl.offsetHeight;
    const showResizeBtn = scrollHeight > height;
    this.setState({ showResizeBtn });
  }

  render() {
    const { script, optional, data, isData, noKey } = this.props;
    const showAllClass = cn(this.props.className, {
      [styles.showAllScript]: this.state.showAllScript,
    });

    const hasScript = script || (data && data.length);

    if (optional && !hasScript) {
      return null;
    }

    const toCopy = !isData ? script : JSON.stringify(data || [], null, 4);

    return (
      <div>
        {hasScript && (
          <div
            className={`plate plate-with-controls break-all ${showAllClass}`}
          >
            {!isData && (
              <ContentScript getScriptRef={this.getScriptRef} script={script} />
            )}
            {isData && !noKey && (
              <Data data={data} getScriptRef={this.getScriptRef} />
            )}
            {isData && noKey && (
              <DataNoKey data={data} getScriptRef={this.getScriptRef} />
            )}
            <div className="buttons-wrapper">
              {hasScript ? (
                <Copy text={toCopy} onCopy={this.onCopy}>
                  <Button>
                    <Trans i18nKey="showScriptComponent.copyCode">
                      Copy code
                    </Trans>
                  </Button>
                </Copy>
              ) : null}
              {this.state.showResizeBtn ? (
                <Button onClick={this.toggleShowScript}>
                  {!this.state.showAllScript ? (
                    <Trans i18nKey="showScriptComponent.showAll">
                      Show all
                    </Trans>
                  ) : (
                    <Trans i18nKey="showScriptComponent.hide">Hide</Trans>
                  )}
                </Button>
              ) : null}
            </div>

            <Modal
              animation={Modal.ANIMATION.FLASH_SCALE}
              showModal={this.state.showCopied}
            >
              <div className="modal notification">
                <Trans i18nKey="showScriptComponent.copied">Copied!</Trans>
              </div>
            </Modal>
          </div>
        )}
      </div>
    );
  }

  protected _onCopy() {
    if (!this.props.showNotify) {
      return null;
    }

    this.setState({ showCopied: true });
    clearTimeout(this._t);
    this._t = setTimeout(() => this.setState({ showCopied: false }), 1000);
  }
}
