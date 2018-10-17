module.exports = class WebpackShellPlugin {
    constructor(options) {

        const defaultOptions = {
            onBuildStart: [],
            onBuildEnd: []
        };
        this.options = Object.assign(defaultOptions, options);
    }

    apply(compiler) {
        const options = this.options;

        compiler.plugin("compilation", compilation => {
            if(options.onBuildStart.length){
                console.log("Executing pre-build scripts");
                options.onBuildStart.forEach(script => script());
            }
        });

        compiler.plugin("afterEmit", (compilation) => {
            if(options.onBuildEnd.length){
                console.log("Executing post-build scripts");
                options.onBuildEnd.forEach(script => script());
            }
        });
    }

};
