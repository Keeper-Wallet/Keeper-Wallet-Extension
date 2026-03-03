// Mock swap constants
const mockKeeperLogo = 'keeper-logo.svg';
const mockPuzzleLogo = 'puzzle-logo.svg';
const mockSwopfiLogo = 'swopfi-logo.svg';

jest.mock('swap/constants', () => ({
  SwapVendor: {
    Keeper: 'keeper',
    Puzzle: 'puzzle',
    Swopfi: 'swopfi',
  },
  swapVendorLogosByName: {
    keeper: mockKeeperLogo,
    puzzle: mockPuzzleLogo,
    swopfi: mockSwopfiLogo,
  },
}));

import { SwapVendor } from 'swap/constants';

import { getSwapVendorLogo } from './utils';

describe('swap/utils', () => {
  describe('getSwapVendorLogo', () => {
    it('should return Keeper logo for Keeper vendor', () => {
      const result = getSwapVendorLogo(SwapVendor.Keeper);
      expect(result).toBe(mockKeeperLogo);
    });

    it('should return Puzzle logo for Puzzle vendor', () => {
      const result = getSwapVendorLogo(SwapVendor.Puzzle);
      expect(result).toBe(mockPuzzleLogo);
    });

    it('should return Swopfi logo for Swopfi vendor', () => {
      const result = getSwapVendorLogo(SwapVendor.Swopfi);
      expect(result).toBe(mockSwopfiLogo);
    });
  });
});
