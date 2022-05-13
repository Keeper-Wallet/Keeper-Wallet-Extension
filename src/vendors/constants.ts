export enum SwapVendor {
  Keeper = 'keeper',
  Puzzle = 'puzzle',
  Swopfi = 'swopfi',
}

export const swapVendorLogosByName = {
  [SwapVendor.Keeper]: require('./logos/keeper.svg'),
  [SwapVendor.Puzzle]: require('./logos/puzzle.svg'),
  [SwapVendor.Swopfi]: require('./logos/swopfi.svg'),
};
