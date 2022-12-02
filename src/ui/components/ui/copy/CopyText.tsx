import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { PureComponent } from 'react';

import * as styles from './copy.styl';

const DEFAULT_HIDDEN_CONTENT =
  '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';

export class CopyText extends PureComponent<IProps> {
  readonly state = { showText: false };

  showTextHandler = () => {
    this.setState({
      showText: true,
    });
  };

  onCopyHandler = (event: React.MouseEvent<HTMLDivElement>) =>
    this._copyText(event);

  render() {
    const iconClass = clsx(styles.firstIcon, {
      'password-icon': this.props.type === 'key',
    });

    const copyIcon = clsx(styles.lastIcon, 'copy-icon');

    const toggleHandler = this.props.toggleText
      ? this.showTextHandler
      : undefined;

    const showText = this.props.toggleText
      ? this.state.showText
      : this.props.showText;

    return (
      <div onClick={toggleHandler}>
        <div>
          {this.props.type ? <i className={iconClass}> </i> : null}
          <div className={styles.copyTextOverflow}>
            {showText ? this.props.text : DEFAULT_HIDDEN_CONTENT}
          </div>
          {this.props.showCopy ? (
            <div className={copyIcon} onClick={this.onCopyHandler} />
          ) : null}
          {this.props.showConfirmed ? <div>Confirm</div> : null}
          {this.props.showNotAccess ? <div>N/A</div> : null}
        </div>
      </div>
    );
  }

  private _copyText(event: React.MouseEvent<HTMLDivElement>) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.props.getText) {
      this.props.getText(text => this.copy(text));
      return null;
    }

    const text = this.props.text;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.copy(text!);
  }

  private copy(text: string) {
    const result = copy(text, this.props.copyOptions);
    if (this.props.onCopy) {
      this.props.onCopy(text, result);
    }
  }
}

interface IProps {
  text?: string;
  getText?: (cb: (text: string) => void) => void;
  onCopy?: (...args: unknown[]) => void;

  toggleText?: boolean;
  copyOptions?: {
    debug?: boolean;
    message?: string;
    format?: string; // MIME type
    onCopy?: (clipboardData: object) => void;
  };
  type?: string;
  showText?: boolean;

  showConfirmed?: boolean;
  showNotAccess?: boolean;
  showCopy?: boolean;
}
