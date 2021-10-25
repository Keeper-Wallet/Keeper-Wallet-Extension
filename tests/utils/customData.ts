export const CUSTOM_DATA_V1 = {
    version: 1,
    binary: 'base64:AADDEE==',
};

export const CUSTOM_DATA_V2 = {
    version: 2,
    data: [
        {
            key: 'stringValue',
            type: 'string',
            value: 'Lorem ipsum dolor sit amet',
        },
        {
            key: 'longMaxValue',
            type: 'integer',
            value: '9223372036854775807',
        },
        { key: 'flagValue', type: 'boolean', value: true },
        { key: 'base64', type: 'binary', value: 'base64:BQbtKNoM' },
    ],
};
