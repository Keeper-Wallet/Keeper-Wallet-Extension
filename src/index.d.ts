type TTransaction = ( tx: TTx, needSend: boolean ) => Promise<TId>;
type TId = string;
type TStatus = string;
type TResult = any;
type TTx = any;
type TRx = any;
type TMOS = any;
type TMO = any;
type TMC = any;
type TSD = any;
type TCD = any;

export namespace WavesKeeper {
    
    export function checkMessage(id: TId): Promise<TResult>;
    export function cancelMessage(id: TId): Promise<TStatus>;
    
    export namespace node {
        export const transfer: TTransaction;
        export const masTransfer: TTransaction;
        export const alias: TTransaction;
        export const issue: TTransaction;
        export const reissue: TTransaction;
        export const burn: TTransaction;
        export const lease: TTransaction;
        export const cancelLease: TTransaction;
        export const exchange: TTransaction;
        export const data: TTransaction;
        export const sponsorShip: TTransaction;
        export const setScript: TTransaction;
        export const setAssetScript: TTransaction;
        export const package: (props: Array<TTx>) => Promise<TId>;
        export const updateAssetInfo: TTransaction;
    }
    
    export namespace matcher {
        function createOrder( tx: TMO, needSend: boolean ): Promise<TId>;
        function cancelOrder( tx: TMC, needSend: boolean ): Promise<TId>;
        function matcherOrders( rx: TMOS ): Promise<TId>;
    }
    
    export namespace custom {
        export function sign( rx: TSD ): Promise<TId>;
    }
}
