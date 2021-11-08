module.exports = class WebpackShellPlugin {
  constructor(options) {
    const defaultOptions = {
      onBuildStart: [],
      onBuildEnd: [],
    };
    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler) {
    const options = this.options;

    compiler.hooks.beforeRun.tapPromise(
      'Custom actions on start',
      (source, target, routesList) => {
        const promises = [];
        (options.onBuildStart || []).forEach(script =>
          promises.push(script(compiler))
        );
        return Promise.all(promises);
      }
    );

    compiler.hooks.afterEmit.tapPromise('Custom actions on end', () => {
      const promises = [];
      (options.onBuildEnd || []).forEach(script =>
        promises.push(script(compiler))
      );
      return Promise.all(promises);
    });
  }
};
