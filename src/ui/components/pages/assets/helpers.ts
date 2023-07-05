export const icontains = (
  source: string | null | undefined,
  target: string | null | undefined,
) => (source ?? '').toLowerCase().includes((target ?? '').toLowerCase());
