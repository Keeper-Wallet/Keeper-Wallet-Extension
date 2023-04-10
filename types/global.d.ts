// from webpack.DefinePlugin
declare const __AMPLITUDE_API_KEY__: string | undefined;
declare const __MIXPANEL_TOKEN__: string | undefined;
declare const __SENTRY_DSN__: string | undefined;
declare const __SENTRY_ENVIRONMENT__: string | undefined;
declare const __SENTRY_RELEASE__: string | undefined;

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
