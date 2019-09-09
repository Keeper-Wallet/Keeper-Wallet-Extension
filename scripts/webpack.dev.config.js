module.exports = (conf) => {
    return {
        ...conf,
        mode: 'development',
        devtool: 'inline-source-map',
        module: {
            ...conf.module,
            rules: [
                {
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader"
                },
                ...conf.module.rules,
            ]
        }
    };
};
