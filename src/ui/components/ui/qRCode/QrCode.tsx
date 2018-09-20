import * as React from 'react';
import * as QrCode from 'qrcode';
import cn from 'classnames';

const DEFAULTS = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    rendererOpts: {
        quality: 0.3,
    },
    margin: 4,
    scale: 4,
    width: 100,
    height: 100,
    color: {
        dark: '#000000ff',
        light: '#ffffffff'
    }
};

export class QRCode extends React.PureComponent {

    readonly props;
    readonly state;

    render() {
        const state = this.state;

        const options = {
            errorCorrectionLevel: state.errorCorrectionLevel,
            type: state.type,
            color: {
                dark: state.dark,
                light: state.light,
            },
            rendererOpts: {
                quality: state.quality,
            },
            margin: state.margin,
            scale: state.scale,
            width: state.width,
            height: state.height,
        };

        if (state.hasChanged) {
            QrCode.toDataURL(state.text, options, (err, url) => {
                this.setState({src: url});
            });
        }

        return <div className={this.state.className} {...this.state.props}>
            <img srcSet={state.src} width={state.width} height={state.height}/>
            {this.props.children}
        </div>;
    }

    static getDerivedStateFromProps(nextProps, state) {
        const {
            errorCorrectionLevel = DEFAULTS.errorCorrectionLevel,
            type = DEFAULTS.type,
            quality = DEFAULTS.rendererOpts.quality,
            margin = DEFAULTS.margin,
            scale = DEFAULTS.scale,
            width = DEFAULTS.width,
            height = DEFAULTS.height,
            dark = DEFAULTS.color.dark,
            light = DEFAULTS.color.light,
            text = '',
            className = '',
            ...props
        } = nextProps;

        const rootClassName = cn(className);
        const hasChanged = !state || state.text !== text;
        return {
            errorCorrectionLevel,
            type,
            quality,
            margin,
            scale,
            width,
            height,
            dark,
            light,
            className: rootClassName,
            hasChanged,
            text,
            props
        };
    }
}
