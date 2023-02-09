declare module 'callbag-tap' {
  import { type Source } from 'callbag';

  export default function tap<T>(
    operation: (data: T) => void
  ): (source: Source<T>) => Source<T>;
}
