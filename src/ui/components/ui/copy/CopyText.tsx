import * as React from 'react';
import * as styles from './copy.styl';
import * as copy from 'copy-to-clipboard';
import cn from 'classnames';

const DEFAULT_HIDDEN_CONTENT = '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';

export class CopyText extends React.PureComponent {
    readonly state = { showText: false };
    readonly props: IProps;

    showTextHandler = () => {
        this.setState({
            showText: true,
        });
    };

    onCopyHandler = (event) => this._copyText(event);

    render() {
        const iconClass = cn(styles.firstIcon, {
            'password-icon': this.props.type === 'key'
        });

        const copyIcon = cn(styles.lastIcon, 'copy-icon');

        const toggleHandler = this.props.toggleText ? this.showTextHandler : null;
        const showText = this.props.toggleText ? this.state.showText : this.props.showText;

        return <div onClick={toggleHandler}>
           <div>
               {this.props.type ? <div className={iconClass}></div> : null}
               <div>{showText ? this.props.text : DEFAULT_HIDDEN_CONTENT}</div>
               {this.props.showCopy ? <div className={copyIcon} onClick={this.onCopyHandler}/> : null}
               {this.props.showConfirmed ? <div>Confirm</div> : null}
               {this.props.showNotAccess ? <div>N/A</div> : null}
           </div>
        </div>;
    }

    private _copyText(event) {
        if (event) {
            event.stopPropagation();
        }

        if (this.props.getText) {
            this.props.getText().then(text => this.copy(text));
            return null;
        }

        const text = this.props.text;
        this.copy(text)
    }

    private copy(text) {
        const result = copy(text, this.props.copyOptions);
        if (this.props.onCopy) {
            this.props.onCopy(text, result);
        }
    }
}

interface IProps {
    text?: string;
    getText?: () => Promise<string>;
    onCopy?: (...args) => void;

    toggleText?: boolean;
    copyOptions?: any;
    type?: string;
    showText?: boolean;

    showConfirmed?: boolean;
    showNotAccess?: boolean;
    showCopy?: boolean;
}
