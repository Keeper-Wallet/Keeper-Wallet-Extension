import { customData, verifyCustomData } from '@waves/waves-transactions';


export const waves = {

    parseCustomData: (message) => {
        if (!message || message.type !== 'customData') {
            throw new Error('Incorrect data for sign custom data');
        }

        const { data } = message;
        const { hash } = customData(data, 'fake user');
        return {
            id: hash,
        };
    },

    verifyCustomData: async (data) => {
        return verifyCustomData(data);
    },

    signCustomData: async (data, user) => {
        return customData(data, user.seed);
    }
};
