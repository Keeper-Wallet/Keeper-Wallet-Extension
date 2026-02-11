import BigNumber from '@waves/bignumber';

import { JSONbn } from './jsonBn';

describe('JSONbn', () => {
  describe('parse - basic functionality', () => {
    it('should parse simple JSON object', () => {
      const json = '{"name":"test","value":123}';
      const result = JSONbn.parse(json);

      expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('should parse JSON array', () => {
      const json = '[1,2,3]';
      const result = JSONbn.parse(json);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should parse nested objects', () => {
      const json = '{"outer":{"inner":"value"}}';
      const result = JSONbn.parse(json);

      expect(result).toEqual({ outer: { inner: 'value' } });
    });

    it('should parse strings', () => {
      const json = '"hello"';
      const result = JSONbn.parse(json);

      expect(result).toBe('hello');
    });

    it('should parse booleans', () => {
      expect(JSONbn.parse('true')).toBe(true);
      expect(JSONbn.parse('false')).toBe(false);
    });

    it('should parse null', () => {
      const result = JSONbn.parse('null');

      expect(result).toBeNull();
    });
  });

  describe('parse - numbers within safe integer range', () => {
    it('should parse small positive integers as numbers', () => {
      const json = '{"value":42}';
      const result = JSONbn.parse(json);

      expect(result.value).toBe(42);
      expect(typeof result.value).toBe('number');
    });

    it('should parse negative integers as numbers', () => {
      const json = '{"value":-100}';
      const result = JSONbn.parse(json);

      expect(result.value).toBe(-100);
      expect(typeof result.value).toBe('number');
    });

    it('should parse zero as number', () => {
      const json = '{"value":0}';
      const result = JSONbn.parse(json);

      expect(result.value).toBe(0);
      expect(typeof result.value).toBe('number');
    });

    it('should parse decimal numbers as numbers', () => {
      const json = '{"value":123.456}';
      const result = JSONbn.parse(json);

      expect(result.value).toBe(123.456);
      expect(typeof result.value).toBe('number');
    });

    it('should parse MAX_SAFE_INTEGER as number', () => {
      const json = `{"value":${Number.MAX_SAFE_INTEGER}}`;
      const result = JSONbn.parse(json);

      expect(result.value).toBe(Number.MAX_SAFE_INTEGER);
      expect(typeof result.value).toBe('number');
    });
  });

  describe('parse - large numbers as BigNumber', () => {
    it('should parse numbers larger than MAX_SAFE_INTEGER as BigNumber', () => {
      const largeNumber = '9007199254740992'; // MAX_SAFE_INTEGER + 1
      const json = `{"value":${largeNumber}}`;
      const result = JSONbn.parse(json);

      expect(BigNumber.isBigNumber(result.value)).toBe(true);
      expect(result.value.toString()).toBe(largeNumber);
    });

    it('should parse very large numbers as BigNumber', () => {
      const veryLargeNumber = '999999999999999999999999';
      const json = `{"value":${veryLargeNumber}}`;
      const result = JSONbn.parse(json);

      expect(BigNumber.isBigNumber(result.value)).toBe(true);
      expect(result.value.toString()).toBe(veryLargeNumber);
    });

    it('should handle multiple large numbers in object', () => {
      const json = '{"amount1":9007199254740992,"amount2":9007199254740993}';
      const result = JSONbn.parse(json);

      expect(BigNumber.isBigNumber(result.amount1)).toBe(true);
      expect(BigNumber.isBigNumber(result.amount2)).toBe(true);
      expect(result.amount1.toString()).toBe('9007199254740992');
      expect(result.amount2.toString()).toBe('9007199254740993');
    });

    it('should handle large numbers in arrays', () => {
      const json = '[9007199254740992, 100, 9007199254740993]';
      const result = JSONbn.parse(json);

      expect(BigNumber.isBigNumber(result[0])).toBe(true);
      expect(typeof result[1]).toBe('number');
      expect(BigNumber.isBigNumber(result[2])).toBe(true);
    });
  });

  describe('stringify - basic functionality', () => {
    it('should stringify simple object', () => {
      const obj = { name: 'test', value: 123 };
      const result = JSONbn.stringify(obj);

      expect(result).toBe('{"name":"test","value":123}');
    });

    it('should stringify array', () => {
      const arr = [1, 2, 3];
      const result = JSONbn.stringify(arr);

      expect(result).toBe('[1,2,3]');
    });

    it('should stringify nested objects', () => {
      const obj = { outer: { inner: 'value' } };
      const result = JSONbn.stringify(obj);

      expect(result).toBe('{"outer":{"inner":"value"}}');
    });

    it('should stringify strings', () => {
      const result = JSONbn.stringify('hello');

      expect(result).toBe('"hello"');
    });

    it('should stringify booleans', () => {
      expect(JSONbn.stringify(true)).toBe('true');
      expect(JSONbn.stringify(false)).toBe('false');
    });

    it('should stringify null', () => {
      const result = JSONbn.stringify(null);

      expect(result).toBe('null');
    });
  });

  describe('stringify - BigNumber values', () => {
    it('should stringify BigNumber as number', () => {
      const obj = { value: new BigNumber('9007199254740992') };
      const result = JSONbn.stringify(obj);

      expect(result).toBe('{"value":9007199254740992}');
    });

    it('should stringify multiple BigNumber values', () => {
      const obj = {
        amount1: new BigNumber('9007199254740992'),
        amount2: new BigNumber('9007199254740993'),
      };
      const result = JSONbn.stringify(obj);

      expect(result).toBe(
        '{"amount1":9007199254740992,"amount2":9007199254740993}',
      );
    });

    it('should stringify BigNumber in array', () => {
      const arr = [
        new BigNumber('9007199254740992'),
        100,
        new BigNumber('9007199254740993'),
      ];
      const result = JSONbn.stringify(arr);

      expect(result).toBe('[9007199254740992,100,9007199254740993]');
    });

    it('should stringify very large BigNumber', () => {
      const obj = { value: new BigNumber('999999999999999999999999') };
      const result = JSONbn.stringify(obj);

      expect(result).toBe('{"value":999999999999999999999999}');
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve small numbers through parse and stringify', () => {
      const original = { value: 123 };
      const json = JSONbn.stringify(original);
      const parsed = JSONbn.parse(json);

      expect(parsed).toEqual(original);
    });

    it('should preserve large numbers through parse and stringify', () => {
      const original = { value: new BigNumber('9007199254740992') };
      const json = JSONbn.stringify(original);
      const parsed = JSONbn.parse(json);

      expect(BigNumber.isBigNumber(parsed.value)).toBe(true);
      expect(parsed.value.toString()).toBe('9007199254740992');
    });

    it('should preserve mixed data types', () => {
      const original = {
        string: 'test',
        number: 42,
        bigNumber: new BigNumber('9007199254740992'),
        boolean: true,
        nullValue: null,
        array: [1, 2, 3],
      };
      const json = JSONbn.stringify(original);
      const parsed = JSONbn.parse(json);

      expect(parsed.string).toBe('test');
      expect(parsed.number).toBe(42);
      expect(BigNumber.isBigNumber(parsed.bigNumber)).toBe(true);
      expect(parsed.bigNumber.toString()).toBe('9007199254740992');
      expect(parsed.boolean).toBe(true);
      expect(parsed.nullValue).toBeNull();
      expect(parsed.array).toEqual([1, 2, 3]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const json = '{}';
      const result = JSONbn.parse(json);

      expect(result).toEqual({});
    });

    it('should handle empty array', () => {
      const json = '[]';
      const result = JSONbn.parse(json);

      expect(result).toEqual([]);
    });

    it('should handle deeply nested structures', () => {
      const json = '{"a":{"b":{"c":{"d":9007199254740992}}}}';
      const result = JSONbn.parse(json);

      expect(BigNumber.isBigNumber(result.a.b.c.d)).toBe(true);
      expect(result.a.b.c.d.toString()).toBe('9007199254740992');
    });

    it('should handle scientific notation for small numbers', () => {
      const json = '{"value":1e5}';
      const result = JSONbn.parse(json);

      expect(result.value).toBe(100000);
      expect(typeof result.value).toBe('number');
    });

    it('should stringify undefined as undefined (not included in object)', () => {
      const obj = { defined: 123, undefined };
      const result = JSONbn.stringify(obj);

      expect(result).toBe('{"defined":123}');
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid JSON', () => {
      expect(() => JSONbn.parse('invalid')).toThrow();
    });

    it('should throw error for malformed JSON', () => {
      expect(() => JSONbn.parse('{"key":}')).toThrow();
    });

    it('should throw error for unclosed brackets', () => {
      expect(() => JSONbn.parse('{"key":"value"')).toThrow();
    });
  });

  describe('practical use cases', () => {
    it('should handle blockchain transaction amounts', () => {
      const transaction = {
        id: 'tx123',
        amount: new BigNumber('10000000000000000'), // 0.1 WAVES in minimal units
        fee: 100000,
      };

      const json = JSONbn.stringify(transaction);
      const parsed = JSONbn.parse(json);

      expect(parsed.id).toBe('tx123');
      expect(BigNumber.isBigNumber(parsed.amount)).toBe(true);
      expect(parsed.amount.toString()).toBe('10000000000000000');
      expect(parsed.fee).toBe(100000);
    });

    it('should handle API response with mixed number types', () => {
      const apiResponse =
        '{"balance":9007199254740992,"timestamp":1234567890,"confirmed":true}';
      const parsed = JSONbn.parse(apiResponse);

      expect(BigNumber.isBigNumber(parsed.balance)).toBe(true);
      expect(typeof parsed.timestamp).toBe('number');
      expect(parsed.confirmed).toBe(true);
    });

    it('should handle array of transactions', () => {
      const transactions = [
        { id: 1, amount: new BigNumber('9007199254740992') },
        { id: 2, amount: 1000 },
        { id: 3, amount: new BigNumber('9007199254740993') },
      ];

      const json = JSONbn.stringify(transactions);
      const parsed = JSONbn.parse(json);

      expect(parsed.length).toBe(3);
      expect(BigNumber.isBigNumber(parsed[0].amount)).toBe(true);
      expect(typeof parsed[1].amount).toBe('number');
      expect(BigNumber.isBigNumber(parsed[2].amount)).toBe(true);
    });
  });
});
