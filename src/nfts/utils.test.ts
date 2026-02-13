import { capitalize } from './utils';

describe('nfts/utils', () => {
  describe('capitalize', () => {
    describe('basic functionality', () => {
      it('should capitalize first letter of lowercase string', () => {
        expect(capitalize('hello')).toBe('Hello');
      });

      it('should capitalize first letter of all lowercase string', () => {
        expect(capitalize('world')).toBe('World');
      });

      it('should keep already capitalized string unchanged', () => {
        expect(capitalize('Hello')).toBe('Hello');
      });

      it('should capitalize first letter and keep rest unchanged', () => {
        expect(capitalize('hELLO')).toBe('HELLO');
      });
    });

    describe('single character', () => {
      it('should capitalize single lowercase letter', () => {
        expect(capitalize('a')).toBe('A');
      });

      it('should keep single uppercase letter unchanged', () => {
        expect(capitalize('A')).toBe('A');
      });

      it('should handle single digit', () => {
        expect(capitalize('1')).toBe('1');
      });

      it('should handle single special character', () => {
        expect(capitalize('!')).toBe('!');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for empty string', () => {
        expect(capitalize('')).toBe('');
      });

      it('should return undefined for undefined', () => {
        expect(capitalize(undefined)).toBeUndefined();
      });

      it('should handle string with spaces', () => {
        expect(capitalize('hello world')).toBe('Hello world');
      });

      it('should handle string starting with space', () => {
        expect(capitalize(' hello')).toBe(' hello');
      });

      it('should handle string with only spaces', () => {
        expect(capitalize('   ')).toBe('   ');
      });
    });

    describe('special characters', () => {
      it('should handle string starting with number', () => {
        expect(capitalize('123abc')).toBe('123abc');
      });

      it('should handle string starting with special character', () => {
        expect(capitalize('!hello')).toBe('!hello');
      });

      it('should handle string with unicode characters', () => {
        expect(capitalize('über')).toBe('Über');
      });

      it('should handle string with emoji', () => {
        expect(capitalize('😀hello')).toBe('😀hello');
      });
    });

    describe('multiple words', () => {
      it('should only capitalize first letter of first word', () => {
        expect(capitalize('hello world test')).toBe('Hello world test');
      });

      it('should not affect capitalization of other words', () => {
        expect(capitalize('hello World Test')).toBe('Hello World Test');
      });
    });
  });
});
