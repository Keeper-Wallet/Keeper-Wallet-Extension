import * as styles from './script.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';
import cn from 'classnames';
import { Copy } from '../copy';
import { Button } from '../buttons';
import { Modal } from '..';


@translate(I18N_NAME_SPACE)
export class ShowScript extends React.PureComponent {
    
    readonly props: { script: string, optional?: boolean, showNotify?: boolean, className?: string };
    readonly state = { showAllScript: false, showCopied: false, showResizeBtn: false };
    protected scriptEl: HTMLDivElement;
    protected _t;
    
    toggleShowScript = () => this.setState({ showAllScript: !this.state.showAllScript });
    onCopy = () => this._onCopy();
    getScriptRef = (ref) => this.scriptEl = ref;
    
    componentDidMount() {
        const { script, optional } = this.props;
        
        if (optional && !script) {
            return null;
        }
    
        const scrollHeight = this.scriptEl.scrollHeight;
        const height = this.scriptEl.offsetHeight;
        const showResizeBtn = scrollHeight > height;
        this.setState({ showResizeBtn });
    }
    
    render() {
        const { script, optional } = this.props;
        const showAllClass = cn(this.props.className, {
                [styles.showAllScript]: this.state.showAllScript
            });
        
        if (optional && !script) {
            return null;
        }
        
        return <div className={`plate plate-with-controls break-all ${showAllClass}`}>
            <pre ref={this.getScriptRef} className={`${styles.codeScript}`}>{script}</pre>
            <div className="buttons-wrapper">
                { script ? <Copy text={script} onCopy={this.onCopy}>
                    <Button>
                        <Trans i18nKey='showScriptComponent.copy'>Copy</Trans>
                    </Button>
                </Copy> : null }
                { this.state.showResizeBtn ? <Button onClick={this.toggleShowScript}>
                    {
                        !this.state.showAllScript ?
                            <Trans i18nKey='showScriptComponent.showAll'>Show all</Trans>:
                            <Trans i18nKey='showScriptComponent.hide'>Hide</Trans>
                    }
                </Button>: null }
            </div>
    
            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={this.state.showCopied}
                   showChildrenOnly={true}>
                <div className='modal notification'>
                    <Trans i18nKey='showScriptComponent.copied'>Copied!</Trans>
                </div>
            </Modal>
        </div>
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
