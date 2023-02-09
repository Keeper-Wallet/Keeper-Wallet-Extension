import { type SwapVendor, swapVendorLogosByName } from 'swap/constants';

export function getSwapVendorLogo(swapVendor: SwapVendor) {
  return swapVendorLogosByName[swapVendor];
}
