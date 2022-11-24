import cn from 'classnames';
import { Fragment, PureComponent } from 'react';
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from 'react-i18next';

import { Modal } from '..';
import { Button } from '../buttons';
import { Copy } from '../copy';
import * as styles from './script.styl';

const ContentScript = ({
  script,
  getScriptRef,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  script: any;
  getScriptRef: (node: HTMLPreElement | null) => unknown;
}) => (
  <pre
    ref={getScriptRef}
    className={cn(styles.codeScript, 'body3')}
    data-testid="contentScript"
  >
    {script}
  </pre>
);

export type EntryWithKey = {
  key: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};
const Data = ({
  data,
  getScriptRef,
}: {
  data: EntryWithKey[];
  getScriptRef: (node: HTMLDivElement | null) => unknown;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.dataContainer} ref={getScriptRef}>
      <table className={cn(styles.data, styles.dataTable)}>
        <thead>
          <tr className={cn('basic500', styles.headRow)}>
            <td className={styles.dataItemData}>
              {t('showScriptComponent.key')}
            </td>
            <td className={styles.dataItemData}>
              {t('showScriptComponent.type')}
            </td>
            <td className={styles.dataItemData}>
              {t('showScriptComponent.value')}
            </td>
          </tr>
        </thead>
        {(data || []).map((item, index) => {
          return (
            <tbody key={index}>
              <tr className={cn(styles.dataRow)} data-testid="dataRow">
                <td
                  title={item.key}
                  className={styles.dataItemData}
                  data-testid="dataRowKey"
                >
                  {item.key}
                </td>
                <td
                  title={item.type}
                  className={styles.dataItemData}
                  data-testid="dataRowType"
                >
                  {item.type}
                </td>
                <td
                  title={String(item.value)}
                  className={styles.dataItemDataLast}
                  data-testid="dataRowValue"
                >
                  {item.type === null && item.value === null
                    ? 'Key Deletion'
                    : typeof item.value === 'boolean'
                    ? String(item.value)
                    : item.value}
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
};

export type EntryNoKey = {
  type: string;
  value: unknown;
};

const DataNoKey = ({
  data,
  getScriptRef,
}: {
  data: EntryNoKey[];
  getScriptRef: (node: HTMLDivElement | null) => unknown;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.dataContainer} ref={getScriptRef}>
      <table className={cn(styles.data, styles.dataTable)}>
        <thead>
          <tr className={cn('basic500', styles.headRow)}>
            <td className={styles.dataItemData}>
              {t('showScriptComponent.type')}
            </td>
            <td className={styles.dataItemDataLast}>
              {t('showScriptComponent.value')}
            </td>
          </tr>
        </thead>
        {(data || []).map((item, index) => {
          const itemValue = item.value;
          const itemValueJson = JSON.stringify(item.value);
          const length = Array.isArray(itemValue) ? itemValue.length : 0;
          return (
            <tbody key={index}>
              <tr className={cn(styles.dataRow)} data-testid="invokeArgument">
                <td
                  className={styles.dataItemData}
                  data-testid="invokeArgumentType"
                >
                  {item.type}
                </td>
                {length ? (
                  <td
                    title={itemValueJson}
                    className={styles.dataItemDataLast}
                    data-testid="invokeArgumentValue"
                  >
                    [
                    {
                      // eslint-disable-next-line @typescript-eslint/no-shadow
                      (itemValue as unknown[]).map((item, index) =>
                        index === length - 1 ? (
                          <Fragment key={index}>
                            {JSON.stringify(item)}]<br />
                          </Fragment>
                        ) : (
                          <Fragment key={index}>
                            {JSON.stringify(item)},<br />
                          </Fragment>
                        )
                      )
                    }
                  </td>
                ) : (
                  <td
                    title={itemValueJson}
                    className={styles.dataItemDataLast}
                    data-testid="invokeArgumentValue"
                  >
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

interface Props extends WithTranslation {
  noKey?: boolean;
  data?: object[];
  isData?: boolean;
  script?: string;
  optional?: boolean;
  showNotify?: boolean;
  className?: string;
  hideScript?: boolean;
}

interface State {
  showAllScript: boolean;
  showCopied: boolean;
  showResizeBtn: boolean;
}

class ShowScriptComponent extends PureComponent<Props, State> {
  state: State = {
    showAllScript: false,
    showCopied: false,
    showResizeBtn: false,
  };
  protected scriptEl: HTMLElement | null | undefined;
  protected _t: ReturnType<typeof setTimeout> | undefined;

  toggleShowScript = () =>
    this.setState({ showAllScript: !this.state.showAllScript });
  onCopy = () => this._onCopy();
  getScriptRef = (ref: HTMLElement | null) => (this.scriptEl = ref);

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
    const { t, script, optional, data, isData, noKey } = this.props;
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
              <Data
                data={data as EntryWithKey[]}
                getScriptRef={this.getScriptRef}
              />
            )}
            {isData && noKey && (
              <DataNoKey
                data={data as EntryNoKey[]}
                getScriptRef={this.getScriptRef}
              />
            )}
            <div className="buttons-wrapper">
              {hasScript ? (
                <Copy text={toCopy} onCopy={this.onCopy}>
                  <Button type="button">
                    {t('showScriptComponent.copyCode')}
                  </Button>
                </Copy>
              ) : null}
              {this.state.showResizeBtn ? (
                <Button type="button" onClick={this.toggleShowScript}>
                  {!this.state.showAllScript
                    ? t('showScriptComponent.showAll')
                    : t('showScriptComponent.hide')}
                </Button>
              ) : null}
            </div>

            <Modal
              animation={Modal.ANIMATION.FLASH_SCALE}
              showModal={this.state.showCopied}
            >
              <div className="modal notification">
                {t('showScriptComponent.copied')}
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

    if (this._t != null) {
      clearTimeout(this._t);
    }

    this._t = setTimeout(() => this.setState({ showCopied: false }), 1000);
  }
}

export const ShowScript = withTranslation()(ShowScriptComponent);
