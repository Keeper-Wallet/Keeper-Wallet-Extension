declare module '*.styl' {
  const url: Record<string, string>;
  export = url;
}

declare module '*.svg' {
  const url: string;
  export = url;
}
