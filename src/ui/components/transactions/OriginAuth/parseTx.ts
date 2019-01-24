export const messageType = 'authOrigin';

export function getAssetsId(tx = null): Array<string> {
    return [];
}

export function getFee(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function isMe(tx: any, type: string) {
    return type === messageType
}
