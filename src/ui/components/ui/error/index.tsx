import * as React from 'react';
import * as styles from './error.styl';
import cn from 'classnames';
import {translate, Trans} from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';


const Errors = ({ errors, show }) => {
    
    if (!show || !errors || !errors.length) {
        return null;
    }
    
    return errors.map(({ key, msg }) => {
        return <Trans i18nKey={key} key={key}>{msg}</Trans>
    });
};

@translate(I18N_NAME_SPACE)
export class Error extends React.PureComponent {

    props: IProps;
    state = { showed: false };
    onClick = (e) => this._onClick(e);

    render() {
        const { showed } = this.state;

        const { className = '', errors, type, children } = this.props;

        if (type === 'modal') {
            return null;
        }

        const errorProps = {
            onClick: this.onClick,
            className: cn(styles.error, className, {
                [styles.modalError]: type && type === 'modal'
            })
        };
        
        return (
            <div { ...errorProps }>
                <Errors errors={errors} show={showed}/>
                {showed ?  children: null}
            </div>
        );
    }

    _onClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e);
            return null;
        }

        if (this.props.hideByClick) {
            this.setState({ hidden: true });
        }
    }

    static getDerivedStateFromProps(props, state) {
        const { showed } = state;
        const { show } = props;

        if (!state || showed != show) {
            return { ...state, showed: show };
        }

        return null;
    }
}

interface IProps {
    t?: (key) => string;
    type?: string;
    show?: boolean;
    children?: any;
    className?: string;
    hideByClick?: boolean;
    onClick?: (...args) => void;
    errors?: Array<{ code: number, key: string, msg: string }>
}
