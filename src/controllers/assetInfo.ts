import { extension } from 'lib/extension';
import ExtensionStore from 'lib/localStore';
import ObservableStore from 'obs-store';
import { NetworkName } from '../accounts/types';
import { NetworkController } from './network';

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
const SUSPICIOUS_PERIOD_IN_MINUTES = 60;
const MAX_AGE = 60 * 60 * 1000;

const MARKETDATA_URL = 'https://marketdata.wavesplatform.com/';
const MARKETDATA_USD_ASSET_ID = 'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p';
const MARKETDATA_PERIOD_IN_MINUTES = 10;

const STATIC_SERVICE_URL = 'https://api.keeper-wallet.app';
const INFO_PERIOD_IN_MINUTES = 240;

const stablecoinAssetIds = new Set([
  '2thtesXvnVMcCnih9iZbJL3d2NQZMfzENJo8YFj6r5jU',
  '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',
  '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ',
  '8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1',
  '8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R',
  'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p',
]);

const defaultAssetTickers = {
  B1dG9exXzJdFASDF2MwCE7TYJE5My4UgVRx43nqDbF6s: 'ABTCLPC',
  '4NyYnDGopZvEAQ3TcBDJrJFWSiA2xzuAw83Ms8jT7WuK': 'ABTCLPM',
  J7UiL1tgEfPaHkrLCirqoyu4v6rVMDc6yPEV95ixorVB: 'AETHLPC',
  Hp4dcR5hYUkrAUrNPazSWEFnt5rUr2suxa2AMo4KsFEf: 'AETHLPM',
  '7TiEKGoXwFXiQCKqj8773QJFY4tCrK3Yku9Q4zenJdPn': 'AUSDCLPA',
  VGLLW8XE5wyMU9NzKNn1s3qSx9AJ1oG8j1xzgwKnaZv: 'AUSDCLPC',
  A9h1bQ2ycMPmS85Dp5NECymsoJ48ZrK8eThdECJZW94b: 'AUSDCLPM',
  K9hzUfVF4Koc5BoihpK1v6GXEpukERCEHNuSRNt83F9: 'AUSDTLPA',
  EemDhgzLQ57hjFbNGYkPJtCnSz5eP2YdMa6H4Pum92z8: 'AUSDTLPC',
  '3iAUM9xnKdu2TWBXRqPvYoGsbiZEbDPP1okUf5v9RJNz': 'AUSDTLPM',
  Euz5HtYcj3nVTZxppA7wdabwTe5BzHFiu4QG1EJtzeUx: 'BAG',
  zMFqXuoyrn5w17PFurTqxB7GsS71fp9dfk6XFwxbPCy: 'BCH',
  '9FgLbjiwhn7wFEviVayHNpUV3WnDWJnox9HS5xpcHNDH': 'BLXS',
  '5UYBPpq4WoU5n4MwpFkgJnW3Fq4B1u3ukpK33ik4QerR': 'BNB',
  F81SdfzBZr5ce8JArRWLPJEDg1V8yT257ohbcHk75yCp: 'BNT',
  DxFwXxS1r3uZ2QEiSqhe6uoXMJBsz4ShLtHvr4HDzNri: 'BRLN',
  '62LyMjcr2DtiyF5yVXFhoQ2q414VPPJXjsNYp72SuDCH': 'BSV',
  '8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1': 'BUSD',
  '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS': 'BTC',
  DRVGiwqmsZpFzaMoAFQXjBNXT4PFepgPvnJ5sGUrhXQt: 'BTCDOWN',
  DazN41oAedqwGZ8aabf4nJQwJNZhsEgPH3YQWDtPsdeV: 'BTCLP',
  '8b53M5vTk8wRBRuJ27ebTvTeGfbjpLZuoZQ7hkFjHsu4': 'BTCUP',
  '8WhH5CCJ6NakPvEvAJcizqqD7H6axhupdYHDFumSDwsy': 'BTCUSDNLP',
  ESaD2AREvgk7o4C9eQkZ8Nmau9BSHqgTK5ymHV36xocy: 'CGU',
  HK72uehJjkM22phZ5wHhBYxprP3r41eYtk9fYu5uetne: 'CGU',
  '9LNqjybyCX1oexCub4yY7hdJf6aeP4HeV5LpsjcNHwRR': 'CNYN',
  '3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb': 'CRV',
  '8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R': 'DAI',
  B3uGHFRpSUuGEDWjqB9LWWxafQj8VTvpMucEyoxzws5H: 'DASH',
  EfdcPXw7o7rrrPWmMBr2sa66Dk95n56622ngujbaGhye: 'DUXPLORER',
  usUeJwSpvghP5FR6jE9X4fUJbgXyxXnAezSgbzoMA8K: 'DUXPLORER',
  '3UHgFQECoynwC3iunYBnbhzmcCzC5gVnVZMv8Yw1bneK': 'EAST',
  C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS: 'EGG',
  '2R57nL7ftpuwbgdprcmAeA9i7ykLH6A4wzLkZHWPiHKc': 'EGGMOON',
  J3dRSWWyRoX55YuuXQhBa2uZ4bUczkqSFC94VZeCoWKA: 'EGGMOON',
  Ej7kEzxvUsoiMtJKiuFpMD9tC6qfCADpZynyW2vqcWW: 'EGGPOINT',
  '6pHc1PyBcXyS74eBEo95V3ecQvhAypL9RfsUUKtHDUq2': 'EGGPOINT',
  '54UszKAj3MtYmkdRCqSXAcaQLaVALBy7CCrVkfmfzhxR': 'EGGSEGGS',
  E4cL4MDRTPz9Wo1hHkxQv4ZzpxVL5136JVaki4wGz2QZ: 'EGGSEGGS',
  '5HGPPLj58XUx3ryMgkASJoqYq33zwBbTMf1CGxfKw6jp': 'ENDO',
  '6muMrLavuvuSZXgy1cQrvYm92rGbprNXGdj6Bg7HAtTV': 'ENDO',
  '7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg': 'ENNO',
  '5dJj4Hn9t2Ve3tRpNGirUHy4yBK6qdJRAJYV21yPPuGz': 'ERG',
  '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu': 'ETH',
  ELzXTgPa6GGYyLtitn2oWDWQ9joyTFEueNtF4kxg95dM: 'ETHLP',
  '6gtgBD12xZkUTnzGofoFJpMg5gYG1FP6PaGyLviVQjbh': 'ETHUSDNLP',
  DUk2YTxhRoAqMJLus4G2b3fR8hMHVh6eiyFx5r29VR6t: 'EURN',
  Crpz6B3cbntgAtb6G7WtZb6ArdifE3QypdxpbaofwKVd: 'FL',
  Dfx6LJPndo1h5Umk9SofDhMDs6Gi8cHyT3873pSgoASU: 'FOMO',
  J4iWJS2kGmAqLC4dYFuHvmqXK1E6rBJaRTA6nd1VmFkj: 'FOMO',
  '46PdJcKzDuYfzLuLNjffM3F8jR8hL357V9AdGK2xN3kx': 'FORKLOG',
  '4q9KXJCi9ZbmhttXuLRabd9epgpvowVuyKDuuNdkahdC': 'FORKLOG',
  '4GZH8rk5vDmMXJ81Xqfm3ovFaczqMnQ11r7aELiNxWBV': 'FTM',
  DhaaqiG8xz8njeBuMtTM2G6avg9Jdhfrxw5onm5GaXx1: 'GBPN',
  '8inca5fv4xr6KZtRMRPYr7vADfk8fd6G2z1gMoRkbUYS': 'JPYN',
  '5m5stLsMZSPomwxTTjJGMMEnjMafRMfap5vZyaLwgMKD': 'KOLKHOZ',
  BwCk5zUMTuYtFFu3euo3g6Fwdk7TALrr5C8wvdzps8R5: 'KOLKHOZ',
  '2bbGhKo5C31iEiB4CwGuqMYwjD7gCA9eXmm51fe2v8vT': 'LINK',
  HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk: 'LTC',
  yDf4UTg4DS75sCNP7oC1HraTN4KHtqmd6WueTid4PF1: 'MARVIN',
  '6xxMPcvHneBvZk7p82oUdQw4J3F9bsFgtm7YYXQSEDxb': 'MARVIN',
  B543bkZcZNo5GrUnd5fxB6EwkiJhAVyKCkPn5nWzZC2s: 'MATH',
  FPzcaiEjyG6syoXLY1aghWdPwExvRezGbPXjmL3Gcofw: 'MATH',
  HcHacFH51pY91zjJa3ZiUVWBww54LnsL4EP3s7hVGo9L: 'MATIC',
  '8HYDtqEuHj3RDcwR8yxEvPq1qQSB9FazC8wMHtRb2TFe': 'MTNT',
  eCNH1aqUnocub8PbNsxLNvZWGeVE98L2Crw3cGY6Gq2: 'MUNA',
  '4kwKSf4Bx2Wq8YxKnVZBhcEHyXzEtJ2pw7ixfJgirwf2': 'MUNDO',
  '2x8vsNgrBgLq9GWpnTNSVXTGq3cMLSvWWepR8CX36fVZ': 'MUNDO',
  '5NmV5VAhkqormdwvaQjE54yPEkNwSRtcXxhLkJbVQqkN': 'NGNN',
  H6CwbwXMRKRw6jb1dRUMVs2N6Sdg2wQcXPRaRkjZSjYU: 'NGNT',
  '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g': 'NSBT',
  '5nk9JW8yRonyNBEwhChoksLxpBECVxbVLqaNuQs9EJn1': 'PESOLATINO',
  '5JQ8yUY4vnB19s4bXSGVYsNEyA9Bag6jbMtVEgFHvYM7': 'PESOLATINO',
  HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS: 'PUZZLE',
  D4TPjtzpsDEJFS1pUAkvh1tJJJMNWGcSrds9sveBoQka: 'RACE',
  eWeMD5KNeuRaALCAb4uuJKtAvon2JcTyXQyoBMhuN2X: 'RUBN',
  EnBAWjayxUrwL7KMTBvRzcS5RqGYwFfLPD4tFVu4Mpj3: 'SCONEX',
  A2hcw6RV23Fc8Y8FNfV35Sq5QeS9Tgp6n8hbrESiRvXX: 'SHEG',
  GVxGPBtgVWMW1wHiFnfaCakbJ6sKgZgowJgW5Dqrd7JH: 'SHIB',
  '9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y': 'SIGN',
  '8wUmN9Y15f3JR4KZfE81XLXpkdgwnqoBNG6NmocZpKQx': 'sNSBT',
  '4CDoUKSAtLTwVTpdxFu6EcbafiCDZUSBXrWGjrAcCPoL': 'sNSBT_TCI',
  CE5cxMvz7865CyFZPFUmDiL4KRkYXP6b6oYgN3vmWdV5: 'STREET',
  DAGQvqQg4F5YTQCQ5JFaVJdZEVoTvecuw2W9ybL5P1hR: 'STREET',
  Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT: 'SWOP',
  bPWkA3MNyEr1TuDchWgdpqJZhGhfPXj7dJdr3qiW2kD: 'TN',
  DGbqkzM6Ds5NAF2B3GHYfyZRmWKt7xLYRYcwpMm7D6V4: 'TRYN',
  '8t4DPWTwPzpatHA9AkTxWAB47THnYzBsDnoY7fQqbG91': 'TSN',
  '5bcAh1r6ydrpk44FEmrnmJQjumgKo3NKEEsyfgmZYwxC': 'TURTLE',
  '9mFbBseP3RSC2veLrBgiLJMXDjahwBiH44WnqMfdkgid': 'TURTLE',
  '8zKqZF6asB6yiK8rv9nMUkJ7wAVBJndSmkC7SXJhRrM3': 'UAHN',
  '4YmM7mj3Av4DPvpNpbtK4jHbpzYDcZuY6UUnYpqTbzLj': 'UNI',
  CsUiySsn7Sq747qG9vT1vtqfZNecheSyUpFeAHGMxQCM: 'USDAP',
  '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ': 'USDC',
  FaCgK3UfvkRF2WfFyKZRVasMmqPRoLG7nUv8HzR451dm: 'USDCLAMBO',
  CrjhbC9gRezwvBZ1XwPQqRwx4BWzoyMHGFNUVdn22ep6: 'USDCLP',
  AEhWyMGY3twQdPQSCqVSdVqxcgzyEn129ipzvbqtTcyv: 'USDFL',
  DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p: 'USDN',
  '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ': 'USDT',
  '4K35syPfY2tYrNWzjh1vbmH39qE4qPV7SwLwekrzD82r': 'USDTLAMBO',
  '9AT2kEi8C4AYxV1qKxtQTVpD5i54jCPvaNNRP6VzRtYZ': 'USDTLP',
  '97zHFp1C3cB7qfvx8Xv5f2rWp9nUSG5UnAamfPcW6txf': 'USDTUSDNLP',
  DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p: 'VIRES',
  FSRHtSyXRXQjzQLRtmaqFpBDDCNjY8PU8KNtwoGXVBmr: 'VIRES_USDC_LP',
  '2tVLdi5fQXk2JcuDAojhctnDp5B5PZhNMyj5GUpeC3tZ': 'VIRES_USDT_LP',
  '45WTLz6e3Ek8Ffe7QHMkQ2TwfozfWsrodTHMtPyTMNtt': 'WAVESDOWN',
  HiiB3SSS1c89J5qQ6RLTUx4qgszLMQS2WRC3wfGfaCF8: 'WAVESUP',
  '7KZbJrVopwJhkdwbe1eFDBbex4dkY63MxjTNjqXtrzj1': 'WAVESUSDNLP',
  DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J: 'WCT',
  '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8': 'WEST',
  AbunLGErT5ctzVN8MVjb4Ad9YgjpubB8Hqb17VxzfAck: 'WW',
  Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on: 'WX',
  F2AKkA513k5yHEJkLsU6vWxCYYk811GpjLhwEv2WGwZ9: 'WXUSDNLP',
  '5WvPKSJXzVE2orvbkJ8wsQmmQKqTv9sGBPksV4adViw3': 'XMR',
  BLRxWVJWaVuR2CsCoTvTw2bDZ3sQLeTbCofcJv7dP5J4: 'YFI',
  BrjUWjndUanm5VsJkbUip8VRYy6LWJePtxya3FNv4TQa: 'ZEC',
};

function binarySearch(sortedArray, key) {
  let start = 0;
  let end = sortedArray.length - 1;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);

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

type GetNode = NetworkController['getNode'];
type GetNetwork = NetworkController['getNetwork'];

export class AssetInfoController {
  store: ObservableStore;
  getNode: GetNode;
  getNetwork: GetNetwork;

  constructor({
    localStore,
    getNode,
    getNetwork,
  }: {
    localStore: ExtensionStore;
    getNode: GetNode;
    getNetwork: GetNetwork;
  }) {
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
      suspiciousAssets: [],
      usdPrices: {},
      assetLogos: {},
      assetTickers: defaultAssetTickers,
    };
    const initState = localStore.getInitState(defaults);
    this.store = new ObservableStore(initState);
    localStore.subscribe(this.store);

    this.getNode = getNode;
    this.getNetwork = getNetwork;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((initState.suspiciousAssets as any).length === 0) {
      this.updateSuspiciousAssets();
    }

    if (Object.keys(initState.usdPrices).length === 0) {
      this.updateUsdPrices();
    }

    if (
      Object.keys(initState.assetLogos).length === 0 ||
      Object.keys(initState.assetTickers).length === 0
    ) {
      this.updateInfo();
    }

    extension.alarms.create('updateSuspiciousAssets', {
      periodInMinutes: SUSPICIOUS_PERIOD_IN_MINUTES,
    });
    extension.alarms.create('updateUsdPrices', {
      periodInMinutes: MARKETDATA_PERIOD_IN_MINUTES,
    });
    extension.alarms.create('updateInfo', {
      periodInMinutes: INFO_PERIOD_IN_MINUTES,
    });

    extension.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'updateSuspiciousAssets':
          this.updateSuspiciousAssets();
          break;
        case 'updateUsdPrices':
          this.updateUsdPrices();
          break;
        case 'updateInfo':
          this.updateInfo();
          break;
        default:
          break;
      }
    });
  }

  addTickersForExistingAssets() {
    const { assets, assetTickers } = this.store.getState();

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

  getUsdPrices() {
    return this.store.getState().usdPrices;
  }

  isMaxAgeExceeded(lastUpdated) {
    return (
      new Date().getTime() - new Date(lastUpdated || 0).getTime() > MAX_AGE
    );
  }

  isSuspiciousAsset(assetId) {
    const { assets, suspiciousAssets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network][assetId] || {};

    return network === NetworkName.Mainnet && suspiciousAssets
      ? binarySearch(suspiciousAssets, assetId) > -1
      : asset.isSuspicious;
  }

  async assetInfo(assetId) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (
      assetId === '' ||
      assetId == null ||
      assetId.toUpperCase() === 'WAVES'
    ) {
      return assets[network]['WAVES'];
    }

    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    const asset = assets[network] && assets[network][assetId];
    if (!asset || this.isMaxAgeExceeded(asset.lastUpdated)) {
      const resp = await fetch(url);
      switch (resp.status) {
        case 200: {
          const assetInfo = await resp
            .text()
            .then(text =>
              JSON.parse(
                text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
              )
            );
          assets[network] = assets[network] || {};
          assets[network][assetId] = {
            ...assets[network][assetId],
            ...this.toAssetDetails(assetInfo),
          };
          this.store.updateState({ assets });
          break;
        }
        case 400: {
          const error = await resp.json();
          throw new Error(
            `Could not find info for asset with id: ${assetId}. ${error.message}`
          );
        }
        default:
          throw new Error(await resp.text());
      }
    }

    return assets[network][assetId];
  }

  toAssetDetails(info) {
    const { assetTickers } = this.store.getState();

    return {
      id: info.assetId,
      name: info.name,
      precision: info.decimals,
      description: info.description,
      height: info.issueHeight,
      timestamp: new Date(parseInt(info.issueTimestamp)).toJSON(),
      sender: info.issuer,
      quantity: info.quantity,
      reissuable: info.reissuable,
      hasScript: info.scripted,
      ticker: assetTickers[info.assetId],
      displayName: assetTickers[info.assetId] || info.name,
      minSponsoredFee: info.minSponsoredAssetFee,
      originTransactionId: info.originTransactionId,
      issuer: info.issuer,
      isSuspicious: this.isSuspiciousAsset(info.assetId),
      lastUpdated: new Date().getTime(),
    };
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
    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (assetIds.length === 0) {
      return;
    }

    const resp = await fetch(
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
      case 200: {
        const assetInfos = await resp.json();

        assetInfos.forEach(assetInfo => {
          if (!assetInfo.error) {
            assets[network][assetInfo.assetId] = {
              ...assets[network][assetInfo.assetId],
              ...this.toAssetDetails(assetInfo),
            };
          }
        });
        this.store.updateState({ assets });
        break;
      }
      default:
        throw new Error(await resp.text());
    }
  }

  async updateSuspiciousAssets() {
    const { assets, suspiciousAssets } = this.store.getState();
    const network = this.getNetwork();

    if (!suspiciousAssets || network === NetworkName.Mainnet) {
      const resp = await fetch(new URL(SUSPICIOUS_LIST_URL));

      if (resp.ok) {
        const suspiciousAssets = (await resp.text()).split('\n').sort();

        if (suspiciousAssets) {
          Object.keys(assets[NetworkName.Mainnet]).forEach(
            assetId =>
              (assets[NetworkName.Mainnet][assetId].isSuspicious =
                binarySearch(suspiciousAssets, assetId) > -1)
          );
        }

        this.store.updateState({ assets, suspiciousAssets });
      }
    }
  }

  async updateUsdPrices() {
    const { usdPrices } = this.store.getState();
    const network = this.getNetwork();

    if (!usdPrices || network === NetworkName.Mainnet) {
      const resp = await fetch(new URL('/api/tickers', MARKETDATA_URL));

      if (resp.ok) {
        const tickers = await resp.json();
        const usdPrices = tickers.reduce((acc, ticker) => {
          if (
            !stablecoinAssetIds.has(ticker.amountAssetID) &&
            ticker.priceAssetID === MARKETDATA_USD_ASSET_ID
          ) {
            acc[ticker.amountAssetID] = ticker['24h_close'];
          }

          return acc;
        }, {});

        stablecoinAssetIds.forEach(ticker => {
          usdPrices[ticker] = '1';
        });

        this.store.updateState({ usdPrices });
      }
    }
  }

  async updateInfo() {
    const network = this.getNetwork();

    if (network === NetworkName.Mainnet) {
      const resp = await fetch(new URL('/assets', STATIC_SERVICE_URL));

      if (resp.ok) {
        const assets = await resp.json();

        this.store.updateState(
          assets.reduce(
            (acc, { id, ticker, uri }) => ({
              assetLogos: {
                ...acc.assetLogos,
                [id]: `${STATIC_SERVICE_URL}${uri}`,
              },
              assetTickers: { ...acc.assetTickers, [id]: ticker },
            }),
            {}
          )
        );
      }
    }
  }
}
