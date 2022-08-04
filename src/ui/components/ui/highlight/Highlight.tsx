import * as React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/idea.css';

interface Props {
  data: string | null;
  className: string;
}

export function Highlight({ data, className }: Props) {
  const preRef = React.useRef<HTMLPreElement | null>(null);

  React.useLayoutEffect(() => {
    if (!preRef.current) {
      return;
    }

    hljs.highlightElement(preRef.current);
  }, []);

  return (
    <pre ref={preRef} className={className}>
      {data}
    </pre>
  );
}
