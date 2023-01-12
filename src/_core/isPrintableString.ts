export function isPrintableString(input: string) {
  return /^\P{C}+$/gu.test(input);
}
