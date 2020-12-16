import { DEFAULT_FEE_CONFIG, DEFAULT_FEE_CONFIG_URL } from '../constants';
import { SIGN_TYPE } from "@waves/signature-adapter";
import { libs } from "@waves/waves-transactions";
import { BigNumber } from "@waves/bignumber";

const CONFIG_EXPIRATION_TIME = 60 * 60 * 1000;

const FEE_TYPES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 1002];


const promiseCache = (delta, defaultValue) => cb => {

    const defaultConfig = Promise.resolve(defaultValue);
    let time = null;
    let promise = null;

    return async () => {
        const now = Date.now();

        if (!promise || now - time > delta) {
            try {
                time = now;
                promise = cb();
            } catch (e) {
                promise = defaultConfig;
            }
        }

        return await promise;
    }
};

const isAccountHasExtraFee = async (address, node) => {
    try {
        const response = await fetch(new URL(`/addresses/scriptInfo/${address}`, node).toString());
        const result = await response.json();
        return result.extraFee;
    } catch (e) {
        return 0;
    }
};

const getConfig = async function () {
    const response = await fetch(DEFAULT_FEE_CONFIG_URL);
    return await response.json();
};

const getCachingFeeConfig = promiseCache(CONFIG_EXPIRATION_TIME, DEFAULT_FEE_CONFIG)(getConfig);


export const calculateFeeFabric = (assetInfoController, networkController) => async (adapter, signData) => {
    const { type } = signData;

    const feeConfig = await getCachingFeeConfig();

    if (!FEE_TYPES.includes(type)) {
        return Object.create(null);
    }
    const node = networkController.getNode();
    const signable = adapter.makeSignable(signData);
    const address = await adapter.getAddress();
    const assetIds = await signable.getAssetIds();
    const assets = await Promise.all(assetIds.map(id => assetInfoController.assetInfo(id)));
    const smartAssets = assets.filter(asset => asset.scripted).map(asset => asset.id);

    if (type === SIGN_TYPE.CREATE_ORDER) {
        const minOrderFee = new BigNumber(300000);
        const matcherAddress = libs.crypto.address({ public: signData.data.matcherPublicKey }, adapter.getNetworkByte());
        const extraFee = await isAccountHasExtraFee(matcherAddress, node);
        return signable.getOrderFee(feeConfig, minOrderFee, extraFee, smartAssets);
    }

    const extraFee = await isAccountHasExtraFee(address, node);
    return await signable.getFee(feeConfig, !!extraFee, smartAssets);
};
