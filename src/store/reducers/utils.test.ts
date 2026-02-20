import { type AppAction } from '../types';
import { simpleFabric } from './utils';

describe('store/reducers/utils', () => {
  describe('simpleFabric', () => {
    it('should return default state when state is null', () => {
      const defaultState = { value: 'default' };
      const reducer = simpleFabric(defaultState)('CHANGE_LNG');

      const action: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'en',
      };

      const result = reducer(null as never, action);

      expect(result).toEqual(defaultState);
    });

    it('should return default state when state is undefined', () => {
      const defaultState = { value: 'default' };
      const reducer = simpleFabric(defaultState)('CHANGE_LNG');

      const action: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'en',
      };

      const result = reducer(undefined as never, action);

      expect(result).toEqual(defaultState);
    });

    it('should return payload when action type matches', () => {
      const defaultState = { value: 'default' };
      const reducer = simpleFabric(defaultState)('UPDATE_FROM_LNG');

      const action: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'new-value',
      };

      const result = reducer(defaultState, action);

      expect(result).toBe('new-value');
    });

    it('should return current state when action type does not match', () => {
      const defaultState = { value: 'default' };
      const currentState = { value: 'current' };
      const reducer = simpleFabric(defaultState)('UPDATE_FROM_LNG');

      const action: AppAction = {
        type: 'UPDATE_CURRENT_NETWORK' as never,
        payload: 'mainnet',
      };

      const result = reducer(currentState, action);

      expect(result).toEqual(currentState);
    });

    it('should work with string default state', () => {
      const defaultState = 'default-string';
      const reducer = simpleFabric(defaultState)('UPDATE_FROM_LNG');

      const action: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'new-string',
      };

      const result = reducer(defaultState, action);

      expect(result).toBe('new-string');
    });

    it('should work with number default state', () => {
      const defaultState = 42;
      const reducer = simpleFabric(defaultState)('SET_LOADING');

      const action: AppAction = {
        type: 'SET_LOADING',
        payload: true,
      };

      const result = reducer(defaultState as never, action);

      expect(result).toBe(true);
    });

    it('should work with array default state', () => {
      const defaultState: string[] = [];
      const reducer = simpleFabric(defaultState)('UPDATE_MESSAGES');

      const newMessages = [
        { id: '1', type: 'auth' } as never,
        { id: '2', type: 'transaction' } as never,
      ];

      const action: AppAction = {
        type: 'UPDATE_MESSAGES',
        payload: newMessages,
      };

      const result = reducer(defaultState, action);

      expect(result).toEqual(newMessages);
    });

    it('should work with boolean default state', () => {
      const defaultState = false;
      const reducer = simpleFabric(defaultState)('SET_LOADING');

      const action: AppAction = {
        type: 'SET_LOADING',
        payload: true,
      };

      const result = reducer(defaultState as never, action);

      expect(result).toBe(true);
    });

    it('should work with null payload', () => {
      const defaultState = { value: 'default' };
      const reducer = simpleFabric(defaultState)('UPDATE_APP_STATE');

      const action: AppAction = {
        type: 'UPDATE_APP_STATE',
        payload: null,
      };

      const result = reducer(defaultState as never, action);

      expect(result).toBeNull();
    });

    it('should work with complex object state', () => {
      const defaultState = {
        nested: {
          value: 'default',
          count: 0,
        },
      };
      const reducer = simpleFabric(defaultState)('UPDATE_BALANCES');

      const newState = {
        nested: {
          value: 'updated',
          count: 5,
        },
      };

      const action: AppAction = {
        type: 'UPDATE_BALANCES',
        payload: { addr1: { assets: {} } } as never,
      };

      const result = reducer(newState as never, action);

      expect(result).toEqual({ addr1: { assets: {} } });
    });

    it('should preserve state reference when action does not match', () => {
      const defaultState = { value: 'default' };
      const currentState = { value: 'current' };
      const reducer = simpleFabric(defaultState)('UPDATE_FROM_LNG');

      const action: AppAction = {
        type: 'SET_LOADING',
        payload: true,
      };

      const result = reducer(currentState, action);

      expect(result).toBe(currentState);
    });

    it('should handle multiple action types with different reducers', () => {
      const defaultState1 = 'default1';
      const defaultState2 = 'default2';

      const reducer1 = simpleFabric(defaultState1)('UPDATE_FROM_LNG');
      const reducer2 = simpleFabric(defaultState2)('CHANGE_LNG');

      const action1: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'updated1',
      };

      const action2: AppAction = {
        type: 'CHANGE_LNG',
        payload: 'updated2',
      };

      const result1 = reducer1(defaultState1, action1);
      const result2 = reducer2(defaultState2, action2);

      expect(result1).toBe('updated1');
      expect(result2).toBe('updated2');
    });

    it('should work with empty object as default state', () => {
      const defaultState = {};
      const reducer = simpleFabric(defaultState)('UPDATE_ORIGINS');

      const action: AppAction = {
        type: 'UPDATE_ORIGINS',
        payload: { 'example.com': [] },
      };

      const result = reducer(defaultState as never, action);

      expect(result).toEqual({ 'example.com': [] });
    });

    it('should handle state being 0 (falsy but not null/undefined)', () => {
      const defaultState = 10;
      const currentState = 0;
      const reducer = simpleFabric(defaultState)('CHANGE_LNG');

      const action: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'test',
      };

      const result = reducer(currentState as never, action);

      expect(result).toBe(0);
    });

    it('should handle state being empty string (falsy but not null/undefined)', () => {
      const defaultState = 'default';
      const currentState = '';
      const reducer = simpleFabric(defaultState)('CHANGE_LNG');

      const action: AppAction = {
        type: 'UPDATE_FROM_LNG',
        payload: 'test',
      };

      const result = reducer(currentState, action);

      expect(result).toBe('');
    });
  });
});
