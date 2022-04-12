export const CUSTOM_DATA_V1 = {
  version: 1 as const,
  binary: 'base64:AADDEE==',
};

export const CUSTOM_DATA_V2 = {
  version: 2 as const,
  data: [
    {
      key: 'stringValue',
      type: 'string' as const,
      value: 'Lorem ipsum dolor sit amet',
    },
    {
      key: 'longMaxValue',
      type: 'integer' as const,
      value: '9223372036854775807',
    },
    { key: 'flagValue', type: 'boolean' as const, value: true },
    { key: 'base64', type: 'binary' as const, value: 'base64:BQbtKNoM' },
  ],
};
