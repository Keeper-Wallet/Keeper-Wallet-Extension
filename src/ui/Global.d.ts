declare module '*.module.css' {
  const styles: Record<string, string>;
  export = styles;
}

declare module '*.styl' {
  const styles: Record<string, string>;
  export = styles;
}

declare module '*.svg' {
  const url: string;
  export = url;
}
