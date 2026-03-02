import { handleResponse } from './handleResponse';

describe('handleResponse', () => {
  it('returns parsed JSON when response is ok', async () => {
    const data = { foo: 'bar' };
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue(data),
    } as unknown as Response;

    const result = await handleResponse<typeof data>(response);

    expect(result).toEqual(data);
    expect(response.json).toHaveBeenCalled();
  });

  it('rejects with error message when response is not ok', async () => {
    const response = {
      ok: false,
      text: jest.fn().mockResolvedValue('Unauthorized'),
    } as unknown as Response;

    await expect(handleResponse(response)).rejects.toThrow('Unauthorized');
    expect(response.text).toHaveBeenCalled();
  });

  it('rejects with empty message when error body is empty', async () => {
    const response = {
      ok: false,
      text: jest.fn().mockResolvedValue(''),
    } as unknown as Response;

    await expect(handleResponse(response)).rejects.toThrow('');
  });

  it('does not call text() when response is ok', async () => {
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue({}),
      text: jest.fn(),
    } as unknown as Response;

    await handleResponse(response);

    expect(response.text).not.toHaveBeenCalled();
  });

  it('does not call json() when response is not ok', async () => {
    const response = {
      ok: false,
      json: jest.fn(),
      text: jest.fn().mockResolvedValue('error'),
    } as unknown as Response;

    await expect(handleResponse(response)).rejects.toThrow();

    expect(response.json).not.toHaveBeenCalled();
  });
});
