// Mock crypto functions
const mockBase58Decode = jest.fn();

jest.mock('@keeper-wallet/waves-crypto', () => ({
  base58Decode: mockBase58Decode,
}));

import { NetworkName } from 'networks/types';

import {
  getMatcherPublicKey,
  getNetworkByAddress,
  getNetworkByNetworkCode,
  getNetworkCode,
} from './waves';

describe('waves utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNetworkByNetworkCode', () => {
    it('should return Stagenet for code S', () => {
      const result = getNetworkByNetworkCode('S');
      expect(result).toBe(NetworkName.Stagenet);
    });

    it('should return Testnet for code T', () => {
      const result = getNetworkByNetworkCode('T');
      expect(result).toBe(NetworkName.Testnet);
    });

    it('should return Mainnet for code W', () => {
      const result = getNetworkByNetworkCode('W');
      expect(result).toBe(NetworkName.Mainnet);
    });

    it('should return Custom for unknown code', () => {
      const result = getNetworkByNetworkCode('X');
      expect(result).toBe(NetworkName.Custom);
    });

    it('should return Custom for empty string', () => {
      const result = getNetworkByNetworkCode('');
      expect(result).toBe(NetworkName.Custom);
    });
  });

  describe('getNetworkByAddress', () => {
    it('should return Mainnet for address with W network code', () => {
      // Mock base58Decode to return array where second byte is 'W' (87)
      mockBase58Decode.mockReturnValue(new Uint8Array([1, 87, 3, 4]));

      const result = getNetworkByAddress('3P...');
      expect(result).toBe(NetworkName.Mainnet);
      expect(mockBase58Decode).toHaveBeenCalledWith('3P...');
    });

    it('should return Testnet for address with T network code', () => {
      // Mock base58Decode to return array where second byte is 'T' (84)
      mockBase58Decode.mockReturnValue(new Uint8Array([1, 84, 3, 4]));

      const result = getNetworkByAddress('3M...');
      expect(result).toBe(NetworkName.Testnet);
      expect(mockBase58Decode).toHaveBeenCalledWith('3M...');
    });

    it('should return Stagenet for address with S network code', () => {
      // Mock base58Decode to return array where second byte is 'S' (83)
      mockBase58Decode.mockReturnValue(new Uint8Array([1, 83, 3, 4]));

      const result = getNetworkByAddress('3S...');
      expect(result).toBe(NetworkName.Stagenet);
      expect(mockBase58Decode).toHaveBeenCalledWith('3S...');
    });

    it('should return Custom for address with unknown network code', () => {
      // Mock base58Decode to return array where second byte is 'X' (88)
      mockBase58Decode.mockReturnValue(new Uint8Array([1, 88, 3, 4]));

      const result = getNetworkByAddress('3X...');
      expect(result).toBe(NetworkName.Custom);
    });
  });

  describe('getNetworkCode', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should fetch network code from node API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ generator: '3P...' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockBase58Decode.mockReturnValue(new Uint8Array([1, 87, 3, 4]));

      const result = await getNetworkCode('https://nodes.wavesnodes.com');

      expect(global.fetch).toHaveBeenCalledWith(
        new URL('/blocks/headers/last', 'https://nodes.wavesnodes.com'),
      );
      expect(result).toBe('W');
    });

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(getNetworkCode('https://invalid-node.com')).rejects.toEqual(
        mockResponse,
      );
    });

    it('should throw error when generator is missing', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        getNetworkCode('https://nodes.wavesnodes.com'),
      ).rejects.toThrow('Incorrect node url');
    });
  });

  describe('getMatcherPublicKey', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should fetch matcher public key from API', async () => {
      const mockPublicKey = '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy';
      const mockResponse = {
        ok: true,
        json: async () => mockPublicKey,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockBase58Decode.mockReturnValue(new Uint8Array(32));

      const result = await getMatcherPublicKey(
        'https://matcher.waves.exchange',
      );

      expect(global.fetch).toHaveBeenCalledWith(
        new URL('/matcher', 'https://matcher.waves.exchange'),
      );
      expect(result).toBe(mockPublicKey);
    });

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        getMatcherPublicKey('https://invalid-matcher.com'),
      ).rejects.toEqual(mockResponse);
    });

    it('should throw error when public key length is invalid', async () => {
      const mockPublicKey = 'invalid-key';
      const mockResponse = {
        ok: true,
        json: async () => mockPublicKey,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockBase58Decode.mockReturnValue(new Uint8Array(16)); // Invalid length

      await expect(
        getMatcherPublicKey('https://matcher.waves.exchange'),
      ).rejects.toThrow('Invalid matcher public key');
    });

    it('should accept valid 32-byte public key', async () => {
      const mockPublicKey = '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy';
      const mockResponse = {
        ok: true,
        json: async () => mockPublicKey,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockBase58Decode.mockReturnValue(new Uint8Array(32)); // Valid length

      const result = await getMatcherPublicKey(
        'https://matcher.waves.exchange',
      );

      expect(result).toBe(mockPublicKey);
      expect(mockBase58Decode).toHaveBeenCalledWith(mockPublicKey);
    });
  });
});
