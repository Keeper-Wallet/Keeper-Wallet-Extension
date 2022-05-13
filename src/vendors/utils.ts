import { SwapVendor, swapVendorLogosByName } from 'vendors/constants';

export function getSwapVendorLogo(swapVendor: SwapVendor) {
  return swapVendorLogosByName[swapVendor];
}
