import { pipe, subscribe } from 'wonka';

import { fromWebExtensionEvent } from './wonka';

type MockEvent = {
  addListener: jest.Mock;
  removeListener: jest.Mock;
  emit: (...args: unknown[]) => void;
};

function createMockEvent(): MockEvent {
  const listeners: Array<(...args: unknown[]) => void> = [];
  return {
    addListener: jest.fn((fn: (...args: unknown[]) => void) => {
      listeners.push(fn);
    }),
    removeListener: jest.fn((fn: (...args: unknown[]) => void) => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    emit: (...args: unknown[]) => {
      listeners.forEach(fn => fn(...args));
    },
  };
}

describe('fromWebExtensionEvent', () => {
  it('registers a listener when subscribed', () => {
    const mockEvent = createMockEvent();

    const { unsubscribe } = pipe(
      fromWebExtensionEvent(mockEvent as never),
      subscribe(() => {}),
    );

    expect(mockEvent.addListener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('emits event arguments as an array', () => {
    const mockEvent = createMockEvent();
    const received: unknown[] = [];

    const { unsubscribe } = pipe(
      fromWebExtensionEvent(mockEvent as never),
      subscribe(value => received.push(value)),
    );

    mockEvent.emit('hello', 42);

    expect(received).toEqual([['hello', 42]]);
    unsubscribe();
  });

  it('emits single-argument events as a single-element array', () => {
    const mockEvent = createMockEvent();
    const received: unknown[] = [];

    const { unsubscribe } = pipe(
      fromWebExtensionEvent(mockEvent as never),
      subscribe(value => received.push(value)),
    );

    mockEvent.emit('only');

    expect(received).toEqual([['only']]);
    unsubscribe();
  });

  it('emits multiple successive events', () => {
    const mockEvent = createMockEvent();
    const received: unknown[] = [];

    const { unsubscribe } = pipe(
      fromWebExtensionEvent(mockEvent as never),
      subscribe(value => received.push(value)),
    );

    mockEvent.emit('first');
    mockEvent.emit('second', 'arg');
    mockEvent.emit('third', 1, 2, 3);

    expect(received).toEqual([
      ['first'],
      ['second', 'arg'],
      ['third', 1, 2, 3],
    ]);
    unsubscribe();
  });

  it('removes the listener when unsubscribed', () => {
    const mockEvent = createMockEvent();

    const { unsubscribe } = pipe(
      fromWebExtensionEvent(mockEvent as never),
      subscribe(() => {}),
    );

    unsubscribe();

    expect(mockEvent.removeListener).toHaveBeenCalledTimes(1);
    expect(mockEvent.removeListener).toHaveBeenCalledWith(
      mockEvent.addListener.mock.calls[0][0],
    );
  });

  it('stops emitting events after unsubscribe', () => {
    const mockEvent = createMockEvent();
    const received: unknown[] = [];

    const { unsubscribe } = pipe(
      fromWebExtensionEvent(mockEvent as never),
      subscribe(value => received.push(value)),
    );

    mockEvent.emit('before');
    unsubscribe();
    mockEvent.emit('after');

    expect(received).toEqual([['before']]);
  });
});
