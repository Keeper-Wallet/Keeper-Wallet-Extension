export function isNotNull<T>(v: T): v is NonNullable<T> {
  return v != null;
}
