export function handleResponse<T>(response: Response) {
  return response.ok
    ? (response.json() as T)
    : response.text().then(text => Promise.reject(new Error(text)));
}
