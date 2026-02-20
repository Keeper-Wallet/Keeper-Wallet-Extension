// Mock crypto functions
const mockBase58Decode = jest.fn();
const mockBase58Encode = jest.fn();
const mockBase16Decode = jest.fn();
const mockBase16Encode = jest.fn();
const mockBlake2b = jest.fn();
const mockKeccak = jest.fn();

jest.mock('@keeper-wallet/waves-crypto', () => ({
  base58Decode: mockBase58Decode,
  base58Encode: mockBase58Encode,
  base16Decode: mockBase16Decode,
  base16Encode: mockBase16Encode,
  blake2b: mockBlake2b,
  keccak: mockKeccak,
}));

// Mock ethereumjs-util functions
const mockIsHexString = jest.fn();
const mockIsValidAddress = jest.fn();
const mockIsValidChecksumAddress = jest.fn();

jest.mock('@ethereumjs/util', () => ({
  isHexString: mockIsHexString,
  isValidAddress: mockIsValidAddress,
  isValidChecksumAddress: mockIsValidChecksumAddress,
}));

import {
  fromEthereumToWavesAddress,
  fromWavesToEthereumAddress,
  isEthereumAddress,
  isValidEthereumAddress,
} from './ethereum';

describe('ethereum utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fromWavesToEthereumAddress', () => {
    it('should convert Waves address to Ethereum address', () => {
      // Mock: Waves address decodes to bytes, we extract middle part
      mockBase58Decode.mockReturnValue(
        new Uint8Array([1, 87, 10, 20, 30, 40, 50, 60, 70, 80]),
      );
      mockBase16Encode.mockReturnValue('0a141e28323c4650');

      const result = fromWavesToEthereumAddress('3P...');

      expect(mockBase58Decode).toHaveBeenCalledWith('3P...');
      expect(result).toBe('0x0a141e28323c4650');
    });
  });

  describe('fromEthereumToWavesAddress', () => {
    it('should convert Ethereum address to Waves address for Mainnet', () => {
      mockBase16Decode.mockReturnValue(new Uint8Array([10, 20, 30, 40]));
      mockBlake2b.mockReturnValue(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      mockKeccak.mockReturnValue(
        new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]),
      );
      mockBase58Encode.mockReturnValue('3P...');

      const result = fromEthereumToWavesAddress('0x0a141e28', 87);

      expect(mockBase16Decode).toHaveBeenCalledWith('0a141e28');
      expect(result).toBe('3P...');
    });

    it('should use chainId 87 by default', () => {
      mockBase16Decode.mockReturnValue(new Uint8Array([10, 20, 30, 40]));
      mockBlake2b.mockReturnValue(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
      mockKeccak.mockReturnValue(
        new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]),
      );
      mockBase58Encode.mockReturnValue('3P...');

      fromEthereumToWavesAddress('0x0a141e28');

      // Check that blake2b was called with chainId 87 (0x57)
      expect(mockBlake2b).toHaveBeenCalled();
      const callArg = mockBlake2b.mock.calls[0][0];
      expect(callArg[1]).toBe(87); // Second byte should be chainId
    });
  });

  describe('isEthereumAddress', () => {
    it('should return true for valid Ethereum address', () => {
      mockIsHexString.mockReturnValue(true);

      const result = isEthereumAddress(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      );

      expect(mockIsHexString).toHaveBeenCalledWith(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        20,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid Ethereum address', () => {
      mockIsHexString.mockReturnValue(false);

      const result = isEthereumAddress('invalid');

      expect(result).toBe(false);
    });
  });

  describe('isValidEthereumAddress', () => {
    it('should return true for valid lowercase address', () => {
      mockIsHexString.mockReturnValue(true);
      mockIsValidAddress.mockReturnValue(true);

      const result = isValidEthereumAddress(
        '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
      );

      expect(result).toBe(true);
    });

    it('should return false when not an Ethereum address', () => {
      mockIsHexString.mockReturnValue(false);

      const result = isValidEthereumAddress('not-an-address');

      expect(result).toBe(false);
      expect(mockIsValidAddress).not.toHaveBeenCalled();
    });

    it('should validate checksum for mixed case address when flag is set', () => {
      mockIsHexString.mockReturnValue(true);
      mockIsValidChecksumAddress.mockReturnValue(true);

      const result = isValidEthereumAddress(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        {
          mixedCaseUseChecksum: true,
        },
      );

      expect(mockIsValidChecksumAddress).toHaveBeenCalledWith(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      );
      expect(result).toBe(true);
    });

    it('should skip checksum validation for all lowercase address', () => {
      mockIsHexString.mockReturnValue(true);
      mockIsValidAddress.mockReturnValue(true);

      const result = isValidEthereumAddress(
        '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
        { mixedCaseUseChecksum: true },
      );

      expect(mockIsValidChecksumAddress).not.toHaveBeenCalled();
      expect(mockIsValidAddress).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
