import { isPrintableString } from './isPrintableString';

describe('isPrintableString', () => {
  describe('printable strings', () => {
    it('should return true for simple ASCII text', () => {
      expect(isPrintableString('hello')).toBe(true);
    });

    it('should return true for text with spaces', () => {
      expect(isPrintableString('hello world')).toBe(true);
    });

    it('should return true for alphanumeric strings', () => {
      expect(isPrintableString('abc123')).toBe(true);
    });

    it('should return true for strings with punctuation', () => {
      expect(isPrintableString('Hello, World!')).toBe(true);
    });

    it('should return true for strings with special characters', () => {
      expect(isPrintableString('$100 @user #tag')).toBe(true);
    });

    it('should return true for strings with symbols', () => {
      expect(isPrintableString('© ® ™ € £ ¥')).toBe(true);
    });

    it('should return true for single character', () => {
      expect(isPrintableString('a')).toBe(true);
    });

    it('should return true for numbers as string', () => {
      expect(isPrintableString('12345')).toBe(true);
    });
  });

  describe('unicode characters', () => {
    it('should return true for emoji', () => {
      expect(isPrintableString('😀')).toBe(true);
    });

    it('should return true for multiple emojis', () => {
      expect(isPrintableString('😀😁😂')).toBe(true);
    });

    it('should return true for text with emoji', () => {
      expect(isPrintableString('Hello 👋 World')).toBe(true);
    });

    it('should return true for Chinese characters', () => {
      expect(isPrintableString('你好世界')).toBe(true);
    });

    it('should return true for Russian characters', () => {
      expect(isPrintableString('Привет')).toBe(true);
    });
  });

  describe('control characters (should return false)', () => {
    it('should return false for null character', () => {
      expect(isPrintableString('\0')).toBe(false);
    });

    it('should return false for bell character', () => {
      expect(isPrintableString('\x07')).toBe(false);
    });

    it('should return false for backspace', () => {
      expect(isPrintableString('\b')).toBe(false);
    });

    it('should return false for vertical tab', () => {
      expect(isPrintableString('\v')).toBe(false);
    });

    it('should return false for escape character', () => {
      expect(isPrintableString('\x1B')).toBe(false);
    });

    it('should return false for delete character', () => {
      expect(isPrintableString('\x7F')).toBe(false);
    });

    it('should return false for string containing control character', () => {
      expect(isPrintableString('hello\x00world')).toBe(false);
    });

    it('should return false for string with embedded null', () => {
      expect(isPrintableString('test\0test')).toBe(false);
    });
  });

  describe('whitespace characters', () => {
    it('should return true for regular space', () => {
      expect(isPrintableString(' ')).toBe(true);
    });

    it('should return false for tab character (control character)', () => {
      expect(isPrintableString('\t')).toBe(false);
    });

    it('should return false for newline (control character)', () => {
      expect(isPrintableString('\n')).toBe(false);
    });

    it('should return false for carriage return (control character)', () => {
      expect(isPrintableString('\r')).toBe(false);
    });

    it('should return false for string with newlines', () => {
      expect(isPrintableString('line1\nline2')).toBe(false);
    });

    it('should return false for string with tabs', () => {
      expect(isPrintableString('col1\tcol2')).toBe(false);
    });

    it('should return false for multiline text', () => {
      expect(isPrintableString('line1\r\nline2')).toBe(false);
    });

    it('should return true for non-breaking space', () => {
      expect(isPrintableString('\u00A0')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty string', () => {
      expect(isPrintableString('')).toBe(false);
    });

    it('should return true for string with only spaces', () => {
      expect(isPrintableString('   ')).toBe(true);
    });

    it('should return true for very long printable string', () => {
      const longString = 'a'.repeat(10000);
      expect(isPrintableString(longString)).toBe(true);
    });

    it('should return false for string with single control character at end', () => {
      expect(isPrintableString('hello\x00')).toBe(false);
    });

    it('should return false for string with single control character at start', () => {
      expect(isPrintableString('\x00hello')).toBe(false);
    });
  });

  describe('format characters (should return false)', () => {
    it('should return false for zero-width space', () => {
      expect(isPrintableString('\u200B')).toBe(false);
    });

    it('should return false for zero-width non-joiner', () => {
      expect(isPrintableString('\u200C')).toBe(false);
    });

    it('should return false for zero-width joiner', () => {
      expect(isPrintableString('\u200D')).toBe(false);
    });

    it('should return false for left-to-right mark', () => {
      expect(isPrintableString('\u200E')).toBe(false);
    });

    it('should return false for right-to-left mark', () => {
      expect(isPrintableString('\u200F')).toBe(false);
    });

    it('should return false for string containing format character', () => {
      expect(isPrintableString('hello\u200Bworld')).toBe(false);
    });
  });

  describe('mixed content', () => {
    it('should return true for mixed ASCII and Unicode', () => {
      expect(isPrintableString('Hello 世界')).toBe(true);
    });

    it('should return true for mixed letters and numbers', () => {
      expect(isPrintableString('abc123xyz')).toBe(true);
    });

    it('should return true for URL-like strings', () => {
      expect(isPrintableString('https://example.com')).toBe(true);
    });

    it('should return true for email-like strings', () => {
      expect(isPrintableString('user@example.com')).toBe(true);
    });

    it('should return true for JSON-like strings', () => {
      expect(isPrintableString('{"key":"value"}')).toBe(true);
    });

    it('should return true for mathematical symbols', () => {
      expect(isPrintableString('∑ ∫ ∂ √ ∞')).toBe(true);
    });
  });

  describe('practical use cases', () => {
    it('should validate user input text', () => {
      const userInput = 'John Doe';
      expect(isPrintableString(userInput)).toBe(true);
    });

    it('should reject input with hidden control characters', () => {
      const maliciousInput = 'John\x00Doe';
      expect(isPrintableString(maliciousInput)).toBe(false);
    });

    it('should accept international names', () => {
      expect(isPrintableString('José García')).toBe(true);
      expect(isPrintableString('François Müller')).toBe(true);
      expect(isPrintableString('Владимир Петров')).toBe(true);
    });

    it('should filter array of strings', () => {
      const strings = [
        'valid',
        'also\x00invalid',
        'good',
        'bad\x1B',
        'acceptable',
      ];
      const filtered = strings.filter(isPrintableString);
      expect(filtered).toEqual(['valid', 'good', 'acceptable']);
    });
  });
});
