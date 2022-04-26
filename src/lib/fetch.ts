import { DEFAULT_IDENTITY_CONFIG } from '../constants';

function startsWith(source: string, target: string, flags = 'i'): boolean {
  return !!source.match(new RegExp(`^${target}`, flags));
}

export default (
  endpoint: RequestInfo,
  { headers = {}, ...options }: RequestInit = {}
) => {
  if (
    typeof endpoint === 'string' &&
    (startsWith(endpoint, DEFAULT_IDENTITY_CONFIG.mainnet.cognito.endpoint) ||
      startsWith(endpoint, DEFAULT_IDENTITY_CONFIG.testnet.cognito.endpoint))
  ) {
    return fetch(endpoint, {
      ...options,
      headers: { ...headers, 'X-Application': 'waveskeeper' },
    }).then(async response => {
      if (response.status === 403) {
        const err = await response.json();
        if ('type' in err && 'message' in err) {
          err.__type = err.type;
        }
        response.json = async () => err;
      }
      return response;
    });
  }

  return fetch(endpoint, { headers, ...options });
};
