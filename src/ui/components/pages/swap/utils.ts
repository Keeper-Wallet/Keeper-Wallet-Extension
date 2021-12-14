import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { AccountBalance, SwopFiExchangerData } from 'ui/reducers/updateState';
import { fetchGetMoney } from './api';

const assetIds = {
  mainnet: {
    WAVES: 'WAVES',
    BAG: 'Euz5HtYcj3nVTZxppA7wdabwTe5BzHFiu4QG1EJtzeUx',
    BCH: 'zMFqXuoyrn5w17PFurTqxB7GsS71fp9dfk6XFwxbPCy',
    BNT: 'F81SdfzBZr5ce8JArRWLPJEDg1V8yT257ohbcHk75yCp',
    BSV: '62LyMjcr2DtiyF5yVXFhoQ2q414VPPJXjsNYp72SuDCH',
    BTC: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
    CRV: '3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb',
    DASH: 'B3uGHFRpSUuGEDWjqB9LWWxafQj8VTvpMucEyoxzws5H',
    EAST: '3UHgFQECoynwC3iunYBnbhzmcCzC5gVnVZMv8Yw1bneK',
    EFYT: '725Yv9oceWsB4GsYwyy4A52kEwyVrL5avubkeChSnL46',
    EGG: 'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',
    ENNO: '7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg',
    ERGO: '5dJj4Hn9t2Ve3tRpNGirUHy4yBK6qdJRAJYV21yPPuGz',
    ETH: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
    EUR: 'Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU',
    EURN: 'DUk2YTxhRoAqMJLus4G2b3fR8hMHVh6eiyFx5r29VR6t',
    FL: 'Crpz6B3cbntgAtb6G7WtZb6ArdifE3QypdxpbaofwKVd',
    LTC: 'HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk',
    NSBT: '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g',
    PUZZLE: 'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS',
    SCONEX: 'EnBAWjayxUrwL7KMTBvRzcS5RqGYwFfLPD4tFVu4Mpj3',
    SIGN: '9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y',
    SWOP: 'Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT',
    TN: 'bPWkA3MNyEr1TuDchWgdpqJZhGhfPXj7dJdr3qiW2kD',
    TRY: '2mX5DzVKWrAJw8iwdJnV2qtoeVG9h5nTDpTqC1wb1WEN',
    USD: 'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p',
    USDAP: 'CsUiySsn7Sq747qG9vT1vtqfZNecheSyUpFeAHGMxQCM',
    USDC: '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ',
    USDCLP: 'CrjhbC9gRezwvBZ1XwPQqRwx4BWzoyMHGFNUVdn22ep6',
    USDLP: '9AT2kEi8C4AYxV1qKxtQTVpD5i54jCPvaNNRP6VzRtYZ',
    USDT: '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',
    VIRES: 'DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p',
    WCT: 'DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J',
    WEST: '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8',
    WNET: 'AxAmJaro7BJ4KasYiZhw7HkjwgYtt2nekPuF2CN9LMym',
    WX: 'Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on',
    XMR: '5WvPKSJXzVE2orvbkJ8wsQmmQKqTv9sGBPksV4adViw3',
    ZEC: 'BrjUWjndUanm5VsJkbUip8VRYy6LWJePtxya3FNv4TQa',
  },
  testnet: {
    WAVES: 'WAVES',
    BTC: 'iHTVbu8ArLhtdtJ8BQhyaomgVogSfXT45RtwNFiK4We',
    DASH: '13mWHq1h58WRTiRNBqDRD63gsV8Hq4joxYQzH3iRdHiR',
    ETH: '8Ye7AVyY8TgWbNfQdriLRCBGEPXTb5T48EeBgJTQADNs',
    EURN: 'ECBCkHS68DckpBrzLeoRgYbFg7sCVqR176mPqbXsj9pA',
    LTC: 'Ea5Y9FAfV3MRL2yQHbQXZvjjWtCJ8gvjYcBCfMTaT7TG',
    NSBT: '36mg8NZTaFRDygiVwb8uBnLR51hetJruUCZcxhaVcHj9',
    SWOP: '2HAJrwa8q4SxBx9cHYaBTQdBjdk5wwqdof7ccpAx2uhZ',
    USD: '8UrfDVd5GreeUwm7uPk7eYz1eMv376kzR52C6sANPkwS',
    USDT: 'Had29UYhBkBGa7r1gu5ktr3okMz4e8vWPXzxTXNJUF6H',
    XMR: 'Eox8Cb2cfkFrsYMJSN8TmyfqzbqwjQp4sdJDE6PA9hph',
    ZEC: 'DeiUipcLutVxVVuHxpU8QUZos6KZpnrxakku5YpZSBaT',
  },
};

const logosByName = {
  BAG: require('./assetLogos/BAG.svg'),
  BCH: require('./assetLogos/BCH.svg'),
  BNT: require('./assetLogos/BNT.svg'),
  BSV: require('./assetLogos/BSV.svg'),
  BTC: require('./assetLogos/BTC.svg'),
  CRV: require('./assetLogos/CRV.svg'),
  DASH: require('./assetLogos/DASH.svg'),
  EAST: require('./assetLogos/EAST.svg'),
  EFYT: require('./assetLogos/EFYT.svg'),
  EGG: require('./assetLogos/EGG.svg'),
  ENNO: require('./assetLogos/ENNO.svg'),
  ERGO: require('./assetLogos/ERGO.svg'),
  ETH: require('./assetLogos/ETH.svg'),
  EUR: require('./assetLogos/EUR.svg'),
  EURN: require('./assetLogos/EURN.svg'),
  FL: require('./assetLogos/FL.svg'),
  LTC: require('./assetLogos/LTC.svg'),
  NSBT: require('./assetLogos/NSBT.svg'),
  PUZZLE: require('./assetLogos/PUZZLE.svg'),
  SCONEX: require('./assetLogos/SCONEX.svg'),
  SIGN: require('./assetLogos/SIGN.svg'),
  SWOP: require('./assetLogos/SWOP.svg'),
  TN: require('./assetLogos/TN.svg'),
  TRY: require('./assetLogos/TRY.svg'),
  USD: require('./assetLogos/USD.svg'),
  USDAP: require('./assetLogos/USDAP.svg'),
  USDC: require('./assetLogos/USDC.svg'),
  USDCLP: require('./assetLogos/USDCLP.svg'),
  USDLP: require('./assetLogos/USDLP.svg'),
  USDT: require('./assetLogos/USDT.svg'),
  VIRES: require('./assetLogos/VIRES.svg'),
  WAVES: require('./assetLogos/WAVES.svg'),
  WCT: require('./assetLogos/WCT.svg'),
  WEST: require('./assetLogos/WEST.svg'),
  WNET: require('./assetLogos/WNET.svg'),
  WX: require('./assetLogos/WX.svg'),
  XMR: require('./assetLogos/XMR.svg'),
  ZEC: require('./assetLogos/ZEC.svg'),
};

const assetLogosByNetwork: Partial<{
  [network: string]: Partial<{
    [assetId: string]: string;
  }>;
}> = {
  mainnet: {
    [assetIds.mainnet.BAG]: logosByName.BAG,
    [assetIds.mainnet.BCH]: logosByName.BCH,
    [assetIds.mainnet.BNT]: logosByName.BNT,
    [assetIds.mainnet.BSV]: logosByName.BSV,
    [assetIds.mainnet.BTC]: logosByName.BTC,
    [assetIds.mainnet.CRV]: logosByName.CRV,
    [assetIds.mainnet.DASH]: logosByName.DASH,
    [assetIds.mainnet.EAST]: logosByName.EAST,
    [assetIds.mainnet.EFYT]: logosByName.EFYT,
    [assetIds.mainnet.EGG]: logosByName.EGG,
    [assetIds.mainnet.ENNO]: logosByName.ENNO,
    [assetIds.mainnet.ERGO]: logosByName.ERGO,
    [assetIds.mainnet.ETH]: logosByName.ETH,
    [assetIds.mainnet.EUR]: logosByName.EUR,
    [assetIds.mainnet.EURN]: logosByName.EURN,
    [assetIds.mainnet.FL]: logosByName.FL,
    [assetIds.mainnet.LTC]: logosByName.LTC,
    [assetIds.mainnet.NSBT]: logosByName.NSBT,
    [assetIds.mainnet.PUZZLE]: logosByName.PUZZLE,
    [assetIds.mainnet.SCONEX]: logosByName.SCONEX,
    [assetIds.mainnet.SIGN]: logosByName.SIGN,
    [assetIds.mainnet.SWOP]: logosByName.SWOP,
    [assetIds.mainnet.TN]: logosByName.TN,
    [assetIds.mainnet.TRY]: logosByName.TRY,
    [assetIds.mainnet.USD]: logosByName.USD,
    [assetIds.mainnet.USDAP]: logosByName.USDAP,
    [assetIds.mainnet.USDC]: logosByName.USDC,
    [assetIds.mainnet.USDCLP]: logosByName.USDCLP,
    [assetIds.mainnet.USDLP]: logosByName.USDLP,
    [assetIds.mainnet.USDT]: logosByName.USDT,
    [assetIds.mainnet.VIRES]: logosByName.VIRES,
    [assetIds.mainnet.WAVES]: logosByName.WAVES,
    [assetIds.mainnet.WCT]: logosByName.WCT,
    [assetIds.mainnet.WEST]: logosByName.WEST,
    [assetIds.mainnet.WNET]: logosByName.WNET,
    [assetIds.mainnet.WX]: logosByName.WX,
    [assetIds.mainnet.XMR]: logosByName.XMR,
    [assetIds.mainnet.ZEC]: logosByName.ZEC,
  },
  testnet: {
    [assetIds.testnet.BTC]: logosByName.BTC,
    [assetIds.testnet.DASH]: logosByName.DASH,
    [assetIds.testnet.ETH]: logosByName.ETH,
    [assetIds.testnet.EURN]: logosByName.EURN,
    [assetIds.testnet.LTC]: logosByName.LTC,
    [assetIds.testnet.NSBT]: logosByName.NSBT,
    [assetIds.testnet.SWOP]: logosByName.SWOP,
    [assetIds.testnet.USD]: logosByName.USD,
    [assetIds.testnet.USDT]: logosByName.USDT,
    [assetIds.testnet.WAVES]: logosByName.WAVES,
    [assetIds.testnet.XMR]: logosByName.XMR,
    [assetIds.testnet.ZEC]: logosByName.ZEC,
  },
};

export function getAssetLogo(network: string, assetId: string) {
  return assetLogosByNetwork[network]?.[assetId];
}

export function getAssetBalance(asset: Asset, accountBalance: AccountBalance) {
  return asset.id === 'WAVES'
    ? new Money(accountBalance.available, asset)
    : new Money(accountBalance.assets?.[asset.id]?.balance || '0', asset);
}

export function getAssetIdByName(network: string, assetName: string) {
  return assetIds[network]?.[assetName];
}

export function getDefaultExchanger(
  network: string,
  exchangersMap: { [exchangerId: string]: SwopFiExchangerData }
) {
  const exchangersArr = Object.values(exchangersMap);

  const usdnAssetId = getAssetIdByName(network, 'USD');
  const wavesAssetId = getAssetIdByName(network, 'WAVES');

  const usdnWavesExchanger = exchangersArr.find(
    exchanger =>
      [exchanger.A_asset_id, exchanger.B_asset_id].includes(usdnAssetId) &&
      [exchanger.A_asset_id, exchanger.B_asset_id].includes(wavesAssetId)
  );

  if (usdnWavesExchanger) {
    return usdnWavesExchanger;
  }

  return exchangersArr[0];
}

async function calcToAmount({
  exchangerVersion,
  fromAmountCoins,
  fromBalanceCoins,
  toBalanceCoins,
}: {
  exchangerVersion: number;
  fromAmountCoins: BigNumber;
  fromBalanceCoins: BigNumber;
  toBalanceCoins: BigNumber;
}) {
  return exchangerVersion === 2
    ? new BigNumber(
        await fetchGetMoney({
          fromAmount: fromAmountCoins.toFixed(),
          fromBalance: fromBalanceCoins.toFixed(),
          toBalance: toBalanceCoins.toFixed(),
        })
      )
    : fromAmountCoins
        .mul(toBalanceCoins)
        .div(fromBalanceCoins.add(fromAmountCoins))
        .roundTo(0, BigNumber.ROUND_MODE.ROUND_FLOOR);
}

function calcSwapRate({
  fromAmountCoins,
  fromAsset,
  toAmountCoins,
  toAsset,
}: {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  toAmountCoins: BigNumber;
  toAsset: Asset;
}) {
  return Money.fromCoins(toAmountCoins, toAsset)
    .getTokens()
    .div(Money.fromCoins(fromAmountCoins, fromAsset).getTokens())
    .roundTo(toAsset.precision, BigNumber.ROUND_MODE.ROUND_FLOOR);
}

function applyCommission(commission: BigNumber, amountCoins: BigNumber) {
  return amountCoins
    .mul(new BigNumber(1).sub(commission))
    .roundTo(0, BigNumber.ROUND_MODE.ROUND_FLOOR);
}

function calcMinReceived(
  toAmountCoins: BigNumber,
  slippageTolerancePercents: BigNumber
) {
  return toAmountCoins.mul(
    new BigNumber(100).sub(slippageTolerancePercents).div(100)
  );
}

function calcPriceImpact({
  fromAmountCoins,
  fromAsset,
  fromBalanceCoins,
  toAsset,
  toBalanceCoins,
}: {
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  fromBalanceCoins: BigNumber;
  toAsset: Asset;
  toBalanceCoins: BigNumber;
}) {
  const fromBalanceTokens = Money.fromCoins(
    fromBalanceCoins,
    fromAsset
  ).getTokens();
  const toBalanceTokens = Money.fromCoins(toBalanceCoins, toAsset).getTokens();

  const fromAmountTokens = Money.fromCoins(
    fromAmountCoins,
    fromAsset
  ).getTokens();
  const newFromBalance = fromBalanceTokens.add(fromAmountTokens);

  const newToBalance = fromBalanceTokens
    .mul(toBalanceTokens)
    .div(newFromBalance);

  const ratioBalance = toBalanceTokens.div(fromBalanceTokens);
  const newRatioBalance = newToBalance.div(newFromBalance);

  return new BigNumber(1)
    .sub(newRatioBalance.div(ratioBalance))
    .mul(100)
    .abs()
    .roundTo(3)
    .toNumber();
}

export async function calcExchangeDetails({
  commission,
  exchangerVersion,
  fromAmountCoins,
  fromAsset,
  fromBalanceCoins,
  slippageTolerancePercents,
  toAsset,
  toBalanceCoins,
}: {
  commission: BigNumber;
  exchangerVersion: number;
  fromAmountCoins: BigNumber;
  fromAsset: Asset;
  fromBalanceCoins: BigNumber;
  slippageTolerancePercents: BigNumber;
  toAsset: Asset;
  toBalanceCoins: BigNumber;
}): Promise<{
  feeCoins: BigNumber;
  minReceivedCoins: BigNumber;
  priceImpact: number;
  swapRate: BigNumber;
  toAmountCoins: BigNumber;
}> {
  let feeCoins: BigNumber;
  let swapRate: BigNumber;
  let toAmountCoins: BigNumber;

  if (fromAmountCoins.isZero()) {
    feeCoins = new BigNumber(0);
    toAmountCoins = new BigNumber(0);

    const fakeFromAmountCoins = Money.fromTokens(
      exchangerVersion === 2 ? 10 : 1,
      fromAsset
    ).getCoins();

    const fakeToAmountCoins = await calcToAmount({
      exchangerVersion,
      fromAmountCoins: fakeFromAmountCoins,
      fromBalanceCoins,
      toBalanceCoins,
    });

    swapRate = calcSwapRate({
      fromAmountCoins: fakeFromAmountCoins,
      fromAsset,
      toAmountCoins: applyCommission(commission, fakeToAmountCoins),
      toAsset,
    });
  } else {
    toAmountCoins = await calcToAmount({
      exchangerVersion,
      fromAmountCoins,
      fromBalanceCoins,
      toBalanceCoins,
    });

    feeCoins = toAmountCoins
      .mul(commission)
      .roundTo(0, BigNumber.ROUND_MODE.ROUND_FLOOR);

    toAmountCoins = applyCommission(commission, toAmountCoins);

    swapRate = calcSwapRate({
      fromAmountCoins,
      fromAsset,
      toAmountCoins,
      toAsset,
    });
  }

  return {
    feeCoins,
    minReceivedCoins: calcMinReceived(toAmountCoins, slippageTolerancePercents),
    priceImpact: calcPriceImpact({
      fromAmountCoins,
      fromAsset,
      fromBalanceCoins,
      toAsset,
      toBalanceCoins,
    }),
    swapRate,
    toAmountCoins,
  };
}
