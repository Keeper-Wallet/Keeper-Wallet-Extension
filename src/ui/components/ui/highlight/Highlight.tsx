import * as React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/idea.css';

interface IProps {
  data: string;
  className: string;
}

export class Highlight extends React.Component<IProps> {
  private preRef = React.createRef<HTMLPreElement>();

  componentDidMount() {
    hljs.highlightElement(this.preRef.current);
  }

  render() {
    const { className, data } = this.props;

    return (
      <pre ref={this.preRef} className={className}>
        {data}
      </pre>
    );
  }
}
