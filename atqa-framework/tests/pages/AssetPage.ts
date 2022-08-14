import { BasePage } from './BasePage';

export class AssetPage extends BasePage {
  SELECTORS = {
    WAVES_ASSET: '$WAVES',
    BACK_TO_NFT_BUTTON: { xpath: "//div[contains(text(),'Back to NFTs')]" },
    SEND_BUTTON: '$sendBtn',
    WAVES_FAVORITE_ICON: {
      css: '[data-testid=WAVES] > div:nth-of-type(1) > div:nth-of-type(1) > svg',
    },
    STAGENET_SEED_ACCOUNT: {
      ASSET_STG_1: '$6q5NUugmZLUJxL8gk8UpXVbVgzGt6fhD6VA8vDLKps55',
      ASSET_STG_2: '$9C896JcWFnwdRFw76SDUNTpyhK2kasQJNSXTSZJmPbdD',
      ASSET_STG_3: '$8MHhoKRNXqrGEMNKPnaqELBkVdVmoYF6TurZ8cU9w8u',
    },
    TESTNET_SEED_ACCOUNT: {
      ASSET_TST_1: '$71ZYU35Z7MbSrMzrVctBjg9LRjoj9sCTSFAZkgAZgH1z',
      ASSET_TST_2: '$8D3novLFKo6Ncsf9VPt6hoxfXP2gjw5eMZT4PbZu3V2s',
      ASSET_TST_3: '$95DeZ7EGpepANDxm6spoV3MR7WmhbkBikLTUQx9mARfU',
      ASSET_TST_4: '$9ZhTmdXdG5Kv1kuQ7Q8ZZ9JaHz6akiL3MgofiE1VvAYU',
      ASSET_TST_5: '$B6DKBN3Ny6ZNpQ4XC8hfMnKAgvtNfZCMPk9s8Kn1E86p',
    },
    MAINNET_SEED_ACCOUNT: {
      BTC_ASSET: '$8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
      CRV_ASSET: '$3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb',
      EGG_ASSET: '$C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',
      ETH_ASSET: '$474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
      BTC_ASSET_MORE_BUTTON: {
        css: '[data-testid="8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS"] > div:nth-of-type(2) > [data-testid="moreBtn"]',
      },
    },
    TESTNET_EMAIL_ACCOUNT: {
      ASSET_EMAIL_1: '$DdPFyjEnjf1WxYny739o2bX785AbzChwXoqUNwrTkr1R',
      ASSET_EMAIL_2: '$CMwX2zaHTaxxbkhdAKE9vyBNuzLNrXDheQvVaJpXq7GS',
      NFT_ASSETS: {
        NFT_GROUP: { css: '[title]' },
      },
    },
  };
}
