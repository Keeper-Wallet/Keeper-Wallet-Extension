import 'highlight.js/styles/idea.css';

import hljs from 'highlight.js';
import { useLayoutEffect, useRef } from 'react';

interface Props {
  data: string | null;
  className: string;
}

export function Highlight({ data, className }: Props) {
  const preRef = useRef<HTMLPreElement | null>(null);

  useLayoutEffect(() => {
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
