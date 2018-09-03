import {getAdapterByType} from '@waves/signature-adapter';

export class ExternalDeviceController {
    static async getUserList(adapterType, from, to){
        return (await getAdapterByType(adapterType)).getUserList(from,to)
    }
}