import {
  customData,
  verifyCustomData,
  wavesAuth,
} from '@waves/waves-transactions';

export const waves = {
  parseWavesAuth: message => {
    if (!message || message.type !== 'wavesAuth') {
      throw new Error('Incorrect data for sign wavesAuth data');
    }

    const { data } = message;
    const { hash } = wavesAuth(data, 'fake user');
    return {
      id: hash,
    };
  },

  signWavesAuth: async (data, user) => {
    return wavesAuth(data, user.seed);
  },

  parseCustomData: message => {
    if (!message || message.type !== 'customData') {
      throw new Error('Incorrect data for sign custom data');
    }

    const { data } = message;
    const { hash } = customData(data, 'fake user');
    return {
      id: hash,
    };
  },

  verifyCustomData: async data => {
    return verifyCustomData(data);
  },

  signCustomData: async (data, user) => {
    return customData(data, user.seed);
  },
};
