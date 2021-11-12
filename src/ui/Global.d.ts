declare module '*.module.css' {
  const styles: Record<string, string>;
  export = styles;
}

declare module '*.styl' {
  const url: Record<string, string>;
  export = url;
}

declare module '*.svg' {
  const url: string;
  export = url;
}
