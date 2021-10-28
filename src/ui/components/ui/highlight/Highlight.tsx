import * as React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/idea.css';

interface IProps {
    children: React.ReactNode;
    className: string;
}

export class Highlight extends React.Component<IProps> {
    refEl;

    componentDidMount() {
        this.highlight();
    }

    render() {
        const { className, children } = this.props;

        return (
            <pre>
                <code ref={this.getRef} className={className}>
                    {children}
                </code>
            </pre>
        );
    }

    getRef = (el) => {
        this.refEl = el;
    };

    highlight = () => {
        hljs.highlightElement(this.refEl);
    };
}
