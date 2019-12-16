export const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';

export const CONFIG = {
    SEED_MIN_LENGTH: 24,
    NAME_MIN_LENGTH: 1,
    PASSWORD_MIN_LENGTH: 8,
    MESSAGES_CONFIRM_TIMEOUT: 2000,
    BASE_URL: 'https://waves.exchange',
};

export const I18N_NAME_SPACE = 'extension';

export const ASSETS = {
    "EUR": "Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU",
    "USD": "Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck",
    "BTC": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
    "ETH": "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu",
    "LTC": "HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk",
    "ZEC": "BrjUWjndUanm5VsJkbUip8VRYy6LWJePtxya3FNv4TQa",
    "BCH": "zMFqXuoyrn5w17PFurTqxB7GsS71fp9dfk6XFwxbPCy",
    "TRY": "2mX5DzVKWrAJw8iwdJnV2qtoeVG9h5nTDpTqC1wb1WEN",
    "DASH": "B3uGHFRpSUuGEDWjqB9LWWxafQj8VTvpMucEyoxzws5H",
    "EFYT": "725Yv9oceWsB4GsYwyy4A52kEwyVrL5avubkeChSnL46",
    "WNET": "AxAmJaro7BJ4KasYiZhw7HkjwgYtt2nekPuF2CN9LMym",
    "XMR": "5WvPKSJXzVE2orvbkJ8wsQmmQKqTv9sGBPksV4adViw3",
};

export const ASSETS_NAMES = {
    [ASSETS.EUR]: 'Euro',
    [ASSETS.USD]: 'US Dollar',
    [ASSETS.TRY]: 'TRY',
    [ASSETS.BTC]: 'Bitcoin',
    [ASSETS.ETH]: 'Ethereum'
};
