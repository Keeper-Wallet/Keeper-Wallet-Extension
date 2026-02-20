import {
  getAccountLink,
  getAssetDetailLink,
  getCollectionLink,
  getNftsLink,
  getTxDetailLink,
  getTxHistoryLink,
} from './index';

describe('URL builders', () => {
  describe('getTxDetailLink', () => {
    it('should build mainnet URL without params', () => {
      const result = getTxDetailLink('W', 'abc123');
      expect(result).toBe('https://wavesexplorer.com/tx/abc123');
    });

    it('should build testnet URL with network param', () => {
      const result = getTxDetailLink('T', 'abc123');
      expect(result).toBe(
        'https://wavesexplorer.com/tx/abc123?network=testnet',
      );
    });

    it('should build stagenet URL with network param', () => {
      const result = getTxDetailLink('S', 'abc123');
      expect(result).toBe(
        'https://wavesexplorer.com/tx/abc123?network=stagenet',
      );
    });

    it('should build custom network URL as mainnet', () => {
      const result = getTxDetailLink('custom', 'abc123');
      expect(result).toBe('https://wavesexplorer.com/tx/abc123');
    });

    it('should handle Unit0 testnet transactions', () => {
      const result = getTxDetailLink('88817', 'abc123-456');
      expect(result).toBe('https://explorer-testnet.unit0.dev/tx/abc123');
    });

    it('should handle Unit0 mainnet transactions', () => {
      const result = getTxDetailLink('88811', 'abc123-456');
      expect(result).toBe('https://explorer.unit0.dev/tx/abc123');
    });
  });

  describe('getAccountLink', () => {
    it('should build mainnet address URL', () => {
      const result = getAccountLink('W', '3P123abc');
      expect(result).toBe('https://wavesexplorer.com/addresses/3P123abc');
    });

    it('should build testnet address URL with network param', () => {
      const result = getAccountLink('T', '3N123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3N123abc?network=testnet',
      );
    });

    it('should build stagenet address URL with network param', () => {
      const result = getAccountLink('S', '3M123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3M123abc?network=stagenet',
      );
    });

    it('should handle Unit0 addresses', () => {
      const result = getAccountLink('88817', '0x1234567890abcdef');
      expect(result).toBe(
        'https://explorer-testnet.unit0.dev/address/0x1234567890abcdef',
      );
    });
  });

  describe('getCollectionLink', () => {
    it('should build mainnet collection URL', () => {
      const result = getCollectionLink('W', '3P123abc');
      expect(result).toBe('https://wavesexplorer.com/addresses/3P123abc');
    });

    it('should build testnet collection URL with network param', () => {
      const result = getCollectionLink('T', '3N123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3N123abc?network=testnet',
      );
    });

    it('should handle Unit0 collection addresses', () => {
      const result = getCollectionLink('88817', '0x1234567890abcdef');
      expect(result).toBe(
        'https://explorer-testnet.unit0.dev/token/0x1234567890abcdef',
      );
    });
  });

  describe('getAssetDetailLink', () => {
    it('should build mainnet asset URL', () => {
      const result = getAssetDetailLink('W', 'WAVES');
      expect(result).toBe('https://wavesexplorer.com/assets/WAVES');
    });

    it('should build testnet asset URL with network param', () => {
      const result = getAssetDetailLink('T', 'WAVES');
      expect(result).toBe(
        'https://wavesexplorer.com/assets/WAVES?network=testnet',
      );
    });

    it('should build stagenet asset URL with network param', () => {
      const result = getAssetDetailLink('S', 'WAVES');
      expect(result).toBe(
        'https://wavesexplorer.com/assets/WAVES?network=stagenet',
      );
    });

    it('should handle Unit0 NFT with tokenId', () => {
      const result = getAssetDetailLink('88817', '0x1234567890abcdef', '42');
      expect(result).toBe(
        'https://explorer-testnet.unit0.dev/token/0x1234567890abcdef/instance/42',
      );
    });
  });

  describe('getTxHistoryLink', () => {
    it('should build mainnet transaction history URL', () => {
      const result = getTxHistoryLink('W', '3P123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3P123abc?tab=token_transfers',
      );
    });

    it('should build testnet transaction history URL with network param', () => {
      const result = getTxHistoryLink('T', '3N123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3N123abc?network=testnet?tab=token_transfers',
      );
    });

    it('should build stagenet transaction history URL with network param', () => {
      const result = getTxHistoryLink('S', '3M123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3M123abc?network=stagenet?tab=token_transfers',
      );
    });

    it('should handle Unit0 transaction history', () => {
      const result = getTxHistoryLink('88817', '0x1234567890abcdef');
      expect(result).toBe(
        'https://explorer-testnet.unit0.dev/address/0x1234567890abcdef?tab=token_transfers',
      );
    });
  });

  describe('getNftsLink', () => {
    it('should build mainnet NFTs URL', () => {
      const result = getNftsLink('W', '3P123abc');
      expect(result).toBe('https://wavesexplorer.com/addresses/3P123abc/nft/');
    });

    it('should build testnet NFTs URL with network param', () => {
      const result = getNftsLink('T', '3N123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3N123abc?network=testnet/nft/',
      );
    });

    it('should build stagenet NFTs URL with network param', () => {
      const result = getNftsLink('S', '3M123abc');
      expect(result).toBe(
        'https://wavesexplorer.com/addresses/3M123abc?network=stagenet/nft/',
      );
    });

    it('should handle Unit0 NFTs link', () => {
      const result = getNftsLink('88817', '0x1234567890abcdef');
      expect(result).toBe(
        'https://explorer-testnet.unit0.dev/address/0x1234567890abcdef/nft/',
      );
    });
  });
});
