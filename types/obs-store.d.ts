declare module 'obs-store' {
  export default class ObservableStore<T> {
    constructor(state: T);
    getState(): T;
    putState(state: T): void;
    updateState<K extends keyof T>(state: Pick<T, K> | T): void;
    subscribe(subscriber: (state: T) => void): void;
  }
}

declare module 'obs-store/lib/asStream' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asStream: any;

  export default asStream;
}
