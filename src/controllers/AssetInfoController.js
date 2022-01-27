import ObservableStore from 'obs-store';

const WAVES = {
  quantity: '10000000000000000',
  ticker: 'WAVES',
  id: 'WAVES',
  name: 'Waves',
  precision: 8,
  description: '',
  height: 0,
  timestamp: '2016-04-11T21:00:00.000Z',
  sender: '',
  reissuable: false,
  displayName: 'WAVES',
};
const SUSPICIOUS_LIST_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-community/master/Scam%20tokens%20according%20to%20the%20opinion%20of%20Waves%20Community.csv';
const MAX_AGE = 60 * 60 * 1000;

const assetTickers = {
  Euz5HtYcj3nVTZxppA7wdabwTe5BzHFiu4QG1EJtzeUx: 'BAG',
  '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS': 'BTC',
  ESaD2AREvgk7o4C9eQkZ8Nmau9BSHqgTK5ymHV36xocy: 'CGU',
  '3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb': 'CRV',
  EfdcPXw7o7rrrPWmMBr2sa66Dk95n56622ngujbaGhye: 'DUXPLORER',
  C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS: 'EGG',
  '2R57nL7ftpuwbgdprcmAeA9i7ykLH6A4wzLkZHWPiHKc': 'EGGMOON',
  Ej7kEzxvUsoiMtJKiuFpMD9tC6qfCADpZynyW2vqcWW: 'EGGPOINT',
  '54UszKAj3MtYmkdRCqSXAcaQLaVALBy7CCrVkfmfzhxR': 'EGGSEGGS',
  '5HGPPLj58XUx3ryMgkASJoqYq33zwBbTMf1CGxfKw6jp': 'ENDO',
  '7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg': 'ENNO',
  '5dJj4Hn9t2Ve3tRpNGirUHy4yBK6qdJRAJYV21yPPuGz': 'ERG',
  '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu': 'ETH',
  DUk2YTxhRoAqMJLus4G2b3fR8hMHVh6eiyFx5r29VR6t: 'EURN',
  Crpz6B3cbntgAtb6G7WtZb6ArdifE3QypdxpbaofwKVd: 'FL',
  Dfx6LJPndo1h5Umk9SofDhMDs6Gi8cHyT3873pSgoASU: 'FOMO',
  '46PdJcKzDuYfzLuLNjffM3F8jR8hL357V9AdGK2xN3kx': 'FORKLOG',
  '5m5stLsMZSPomwxTTjJGMMEnjMafRMfap5vZyaLwgMKD': 'KOLKHOZ',
  HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk: 'LTC',
  yDf4UTg4DS75sCNP7oC1HraTN4KHtqmd6WueTid4PF1: 'MARVIN',
  B543bkZcZNo5GrUnd5fxB6EwkiJhAVyKCkPn5nWzZC2s: 'MATH',
  '4kwKSf4Bx2Wq8YxKnVZBhcEHyXzEtJ2pw7ixfJgirwf2': 'MUNDO',
  '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g': 'NSBT',
  '5nk9JW8yRonyNBEwhChoksLxpBECVxbVLqaNuQs9EJn1': 'PESOLATINO',
  D4TPjtzpsDEJFS1pUAkvh1tJJJMNWGcSrds9sveBoQka: 'RACE',
  EnBAWjayxUrwL7KMTBvRzcS5RqGYwFfLPD4tFVu4Mpj3: 'SCONEX',
  '9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y': 'SIGN',
  CE5cxMvz7865CyFZPFUmDiL4KRkYXP6b6oYgN3vmWdV5: 'STREET',
  Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT: 'SWOP',
  bPWkA3MNyEr1TuDchWgdpqJZhGhfPXj7dJdr3qiW2kD: 'TN',
  '5bcAh1r6ydrpk44FEmrnmJQjumgKo3NKEEsyfgmZYwxC': 'TURTLE',
  DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p: 'USDN',
  CsUiySsn7Sq747qG9vT1vtqfZNecheSyUpFeAHGMxQCM: 'USDAP',
  '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ': 'USDC',
  CrjhbC9gRezwvBZ1XwPQqRwx4BWzoyMHGFNUVdn22ep6: 'USDCLP',
  '9AT2kEi8C4AYxV1qKxtQTVpD5i54jCPvaNNRP6VzRtYZ': 'USDTLP',
  '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ': 'USDT',
  DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p: 'VIRES',
  DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J: 'WCT',
  '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8': 'WEST',
  Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on: 'WX',
  '5WvPKSJXzVE2orvbkJ8wsQmmQKqTv9sGBPksV4adViw3': 'XMR',
};

function binarySearch(sortedArray, key) {
  let start = 0;
  let end = sortedArray.length - 1;

  while (start <= end) {
    let middle = Math.floor((start + end) / 2);

    if (sortedArray[middle] === key) {
      return middle;
    } else if (sortedArray[middle] < key) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }

  return -1;
}

export class AssetInfoController {
  constructor(options = {}) {
    const defaults = {
      assets: {
        mainnet: {
          WAVES,
        },
        stagenet: {
          WAVES,
        },
        testnet: {
          WAVES,
        },
        custom: {
          WAVES,
        },
      },
    };
    this.suspiciousAssets = undefined;
    this.suspiciousLastUpdated = 0;

    this.getNode = options.getNode;
    this.getNetwork = options.getNetwork;
    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );
    this.addTickersForExistingAssets();
    this.updateSuspiciousAssets();
  }

  addTickersForExistingAssets() {
    const { assets } = this.store.getState();

    const assetIdsToUpdate = Object.keys(assetTickers).filter(assetId => {
      const asset = assets.mainnet[assetId];
      const ticker = assetTickers[assetId];

      return asset && (asset.displayName !== ticker || asset.ticker !== ticker);
    });

    if (assetIdsToUpdate.length !== 0) {
      assetIdsToUpdate.forEach(assetId => {
        const asset = assets.mainnet[assetId];
        const ticker = assetTickers[assetId];

        asset.displayName = asset.ticker = ticker;
      });

      this.store.updateState({ assets });
    }
  }

  getWavesAsset() {
    return WAVES;
  }

  getAssets() {
    return this.store.getState().assets[this.getNetwork()];
  }

  isMaxAgeExceeded(lastUpdated) {
    return new Date() - new Date(lastUpdated || 0) > MAX_AGE;
  }

  isSuspiciousAsset(assetId) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network][assetId] || {};

    return network === 'mainnet' && this.suspiciousAssets
      ? binarySearch(this.suspiciousAssets, assetId) > -1
      : asset.isSuspicious;
  }

  async assetInfo(assetId) {
    await this.updateSuspiciousAssets();

    const { assets } = this.store.getState();
    if (assetId === '' || assetId == null || assetId.toUpperCase() === 'WAVES')
      return WAVES;

    const network = this.getNetwork();
    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    const asset = assets[network] && assets[network][assetId];
    if (!asset || this.isMaxAgeExceeded(asset.lastUpdated)) {
      let resp = await fetch(url);
      switch (resp.status) {
        case 200:
          let assetInfo = await resp
            .text()
            .then(text =>
              JSON.parse(
                text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
              )
            );
          const mapped = {
            quantity: assetInfo.quantity,
            ticker: assetTickers[assetInfo.assetId],
            id: assetInfo.assetId,
            name: assetInfo.name,
            precision: assetInfo.decimals,
            description: assetInfo.description,
            height: assetInfo.issueHeight,
            timestamp: new Date(parseInt(assetInfo.issueTimestamp)).toJSON(),
            sender: assetInfo.issuer,
            hasScript: assetInfo.scripted,
            reissuable: assetInfo.reissuable,
            displayName: assetTickers[assetInfo.assetId] || assetInfo.name,
            minSponsoredFee: assetInfo.minSponsoredAssetFee,
            originTransactionId: assetInfo.originTransactionId,
            issuer: assetInfo.issuer,
            isSuspicious: this.isSuspiciousAsset(assetInfo.assetId),
            lastUpdated: new Date().getTime(),
          };
          assets[network] = assets[network] || {};
          assets[network][assetId] = { ...assets[network][assetId], ...mapped };
          this.store.updateState({ assets });
          break;
        case 400:
          const error = await resp.json();
          throw new Error(
            `Could not find info for asset with id: ${assetId}. ${error.message}`
          );
        default:
          throw new Error(await resp.text());
      }
    }

    return assets[network][assetId];
  }

  async toggleAssetFavorite(assetId) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network] && assets[network][assetId];

    if (!asset) {
      return;
    }

    assets[network][assetId].isFavorite = !asset.isFavorite;
    this.store.updateState({ assets });
  }

  /**
   * Force-updates storage asset info by assetId list
   * @param {Array<string>} assetIds
   * @returns {Promise<void>}
   */
  async updateAssets(assetIds) {
    await this.updateSuspiciousAssets();

    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (assetIds.length === 0) {
      return;
    }

    let resp = await fetch(
      new URL(`assets/details`, this.getNode()).toString(),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;large-significand-format=string',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: assetIds }),
      }
    );

    switch (resp.status) {
      case 200:
        let assetInfos = await resp.json();
        const lastUpdated = new Date().getTime();

        assetInfos.forEach(assetInfo => {
          if (!assetInfo.error) {
            assets[network][assetInfo.assetId] = {
              ...assets[network][assetInfo.assetId],
              id: assetInfo.assetId,
              name: assetInfo.name,
              precision: assetInfo.decimals,
              description: assetInfo.description,
              height: assetInfo.issueHeight,
              timestamp: new Date(parseInt(assetInfo.issueTimestamp)).toJSON(),
              sender: assetInfo.issuer,
              quantity: assetInfo.quantity,
              reissuable: assetInfo.reissuable,
              hasScript: assetInfo.scripted,
              ticker: assetTickers[assetInfo.assetId],
              displayName: assetTickers[assetInfo.assetId] || assetInfo.name,
              minSponsoredFee: assetInfo.minSponsoredAssetFee,
              originTransactionId: assetInfo.originTransactionId,
              issuer: assetInfo.issuer,
              isSuspicious: this.isSuspiciousAsset(assetInfo.assetId),
              lastUpdated,
            };
          }
        });
        assets[network]['WAVES'] = this.getWavesAsset();
        this.store.updateState({ assets });
        break;
      default:
        throw new Error(await resp.text());
    }
  }

  async updateSuspiciousAssets() {
    let { assets } = this.store.getState();
    const network = this.getNetwork();

    if (
      !this.suspiciousAssets ||
      (network === 'mainnet' &&
        new Date() - new Date(this.suspiciousLastUpdated) > MAX_AGE)
    ) {
      const resp = await fetch(new URL(SUSPICIOUS_LIST_URL));
      switch (resp.status) {
        case 200:
          this.suspiciousAssets = (await resp.text()).split('\n').sort();
          this.suspiciousLastUpdated = new Date().getTime();
          break;
        default:
          throw new Error(await resp.text());
      }
    }

    if (this.suspiciousAssets) {
      Object.keys(assets[network]).forEach(
        assetId =>
          (assets[network][assetId].isSuspicious =
            binarySearch(this.suspiciousAssets, assetId) > -1)
      );
    }

    this.store.updateState({ assets });
  }
}
