// Mock crypto functions
const mockBase64Encode = jest.fn(() => 'base64EncodedData');
const mockEncryptSeed = jest.fn(async () => new Uint8Array([1, 2, 3]));
const mockUtf8Encode = jest.fn(() => new Uint8Array([4, 5, 6]));

jest.mock('@keeper-wallet/waves-crypto', () => ({
  base64Encode: mockBase64Encode,
  encryptSeed: mockEncryptSeed,
  utf8Encode: mockUtf8Encode,
}));

// Mock background service
const mockAssertPasswordIsValid = jest.fn(async () => true);

jest.mock('../ui/services/Background', () => ({
  __esModule: true,
  default: {
    assertPasswordIsValid: mockAssertPasswordIsValid,
  },
}));

import { downloadKeystore } from './utils';

// Mock DOM APIs
const mockClick = jest.fn();
const mockCreateElement = jest.fn(() => ({
  download: '',
  href: '',
  click: mockClick,
}));

const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockBlob = jest.fn();

global.document = {
  createElement: mockCreateElement,
} as never;

global.URL = {
  createObjectURL: mockCreateObjectURL,
} as never;

global.Blob = mockBlob as never;

describe('keystore/utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClick.mockClear();
    mockCreateElement.mockClear();
    mockCreateObjectURL.mockClear();
    mockBlob.mockClear();
    mockAssertPasswordIsValid.mockClear();
    mockAssertPasswordIsValid.mockResolvedValue(true);
  });

  describe('downloadKeystore', () => {
    it('should download accounts keystore file', async () => {
      const accounts = [{ type: 'seed', name: 'Account 1' }];
      const password = 'test-password';

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockBlob).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should download addresses keystore file', async () => {
      const addresses = {
        addr1: 'Address 1',
        addr2: 'Address 2',
      };
      const password = 'test-password';

      await downloadKeystore(undefined, addresses, password, false);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockBlob).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should not download anything when both params are undefined', async () => {
      const password = 'test-password';

      await downloadKeystore(undefined, undefined, password, false);

      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockClick).not.toHaveBeenCalled();
    });

    it('should format filename with current date', async () => {
      const accounts = [{ type: 'seed', name: 'Account 1' }];
      const password = 'test-password';

      const mockAnchor = {
        download: '',
        href: '',
        click: mockClick,
      };
      mockCreateElement.mockReturnValue(mockAnchor);

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockAnchor.download).toMatch(
        /^keystore-accounts-keeper-\d{10}\.json$/,
      );
    });

    it('should handle multichain account type', async () => {
      const accounts = [{ type: 'multichain', name: 'Account 1' }];
      const password = 'test-password';

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle privateKey account type', async () => {
      const accounts = [{ type: 'privateKey', name: 'Account 1' }];
      const password = 'test-password';

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle encodedSeed account type', async () => {
      const accounts = [{ type: 'encodedSeed', name: 'Account 1' }];
      const password = 'test-password';

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle empty addresses object', async () => {
      const addresses = {};
      const password = 'test-password';

      await downloadKeystore(undefined, addresses, password, false);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle multiple accounts', async () => {
      const accounts = [
        { type: 'seed', name: 'Account 1' },
        { type: 'multichain', name: 'Account 2' },
        { type: 'privateKey', name: 'Account 3' },
      ];
      const password = 'test-password';

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should throw error for ledger account type', async () => {
      const accounts = [{ type: 'ledger', name: 'Ledger Account' }];
      const password = 'test-password';

      await expect(
        downloadKeystore(accounts as never, undefined, password, false),
      ).rejects.toThrow('Cannot export ledger account type - not supported');
    });

    it('should throw error for wx account type', async () => {
      const accounts = [{ type: 'wx', name: 'WX Account' }];
      const password = 'test-password';

      await expect(
        downloadKeystore(accounts as never, undefined, password, false),
      ).rejects.toThrow('Cannot export wx account type - not supported');
    });

    it('should throw error for debug account type', async () => {
      const accounts = [{ type: 'debug', name: 'Debug Account' }];
      const password = 'test-password';

      await expect(
        downloadKeystore(accounts as never, undefined, password, false),
      ).rejects.toThrow('Cannot export debug account type - not supported');
    });

    it('should validate password before downloading', async () => {
      const accounts = [{ type: 'seed', name: 'Account 1' }];
      const password = 'test-password';

      await downloadKeystore(accounts as never, undefined, password, false);

      expect(mockAssertPasswordIsValid).toHaveBeenCalledWith(password);
    });
  });
});
