const path = require('path');
const WebpackShellPlugin = require('./scripts/webpackRunAfterBuildPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const copyFiles = require('./scripts/copyFiles');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DownloadJsonPlugin = require('download-json-webpack-plugin');


module.exports = env => {
    const DIST = 'dist';
    const isProduction = env && env.production;
    const SOURCE_FOLDER = path.resolve(__dirname, 'src');
    const DIST_FOLDER = path.resolve(__dirname, DIST);
    const BUID_FOLDER = path.resolve(DIST_FOLDER, 'build');

    const metaScripts = isProduction ? [] : [];
    const browserPlatforms = {
        chrome: {
            copyFiles: [
                {
                    from: path.join(BUID_FOLDER),
                    to: path.join(DIST_FOLDER, 'chrome')
                }
            ],
            manifest: {
                add: {
                    'background.scripts': metaScripts.concat(['background.js'])
                },
                remove: ['applications']
            }
        },
        // edge: {
        //     copyFiles: [
        //         {
        //             from: path.join(BUID_FOLDER),
        //             to: path.join(DIST_FOLDER, 'edge')
        //         }
        //     ],
        //     manifest: {
        //         add: {
        //             'background.scripts': metaScripts.concat(['background.js'])
        //         },
        //         remove: []
        //     }
        // },
        // firefox: {
        //     copyFiles: [
        //         {
        //             from: path.join(BUID_FOLDER),
        //             to: path.join(DIST_FOLDER, 'firefox')
        //         }
        //     ],
        //     manifest: {
        //         add: {
        //             'background.scripts': metaScripts.concat(['background.js'])
        //         },
        //         remove: []
        //     }
        //
        // },
        // opera: {
        //     copyFiles: [
        //         {
        //             from: path.join(BUID_FOLDER),
        //             to: path.join(DIST_FOLDER, 'opera')
        //         }
        //     ],
        //     manifest: {
        //         add: {
        //             'permissions': ['storage', 'tabs', 'clipboardWrite', 'clipboardRead'],
        //             'background.scripts': metaScripts.concat(['background.js'])
        //         },
        //         remove: []
        //     }
        // },
    };

    const ignore = [];
    const copy = [{
        from: path.join(SOURCE_FOLDER, 'copied'),
        to: BUID_FOLDER,
        ignore
    }];

    const plugins = [];
    plugins.push(new CopyWebpackPlugin(copy));
    plugins.push(new ExtractTextPlugin({filename: 'index.css', allChunks: true}));
    plugins.push(new WebpackShellPlugin({onBuildEnd: [onCompileEnd]}));
    plugins.push(new HtmlWebpackPlugin({
        title: 'WavesKeeper',
        filename: 'popup.html',
        template: path.resolve(SOURCE_FOLDER, 'popup.html'),
        hash: true,
        excludeChunks: ['background', 'contentscript', 'inpage'],
    }));
    plugins.push(new HtmlWebpackPlugin({
        title: 'WavesKeeper',
        filename: 'home.html',
        template: path.resolve(SOURCE_FOLDER, 'home.html'),
        hash: true,
        excludeChunks: ['background', 'contentscript', 'inpage'],
    }));
    plugins.push(
        new DownloadJsonPlugin({
            path: 'https://api.locize.io/30ffe655-de56-4196-b274-5edc3080c724/latest/en/extension',
            filename: 'src/copied/_locales/extension_en.json',
        })

    );
    plugins.push(
        new DownloadJsonPlugin({
            path: 'https://api.locize.io/30ffe655-de56-4196-b274-5edc3080c724/latest/ru/extension',
            filename: 'src/copied/_locales/extension_ru.json',
        })

    );
    // if (!isProduction) {
    //     plugins.push(
    //         new LiveReloadPlugin({
    //             port: 35729,
    //         })
    //     );
    // }

    return {
        entry: {
            ui: path.resolve(SOURCE_FOLDER, 'ui.js'),
            background: path.resolve(SOURCE_FOLDER, 'background.js'),
            contentscript: path.resolve(SOURCE_FOLDER, 'contentscript.js'),
            inpage: path.resolve(SOURCE_FOLDER, 'inpage.js'),
        },
        output: {
            filename: '[name].js',
            path: BUID_FOLDER,
            publicPath: './'
        },

        devtool: "source-map",

        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json", ".styl", ".png", ".jpg", ".gif", ".svg", ".woff", ".woff2", ".ttf", ".otf"]
        },

        module: {
            //noParse: /fs/,
            rules: [
                {
                    test: /\.(png|jpg|svg|gif)$/,
                    loader: "url-loader?limit=1000&name=assets/img/[name].[ext]",
                },

                {
                    test: /\.(woff|woff2|ttf|otf)$/,
                    loader: "file-loader?name=assets/fonts/[name].[ext]",
                },
                {
                    test: /\.tsx?$/,
                    loader: "babel-loader!awesome-typescript-loader",
                    exclude: /node_modules/
                },
                {
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader"
                },
                {
                    test: /\.(jsx?)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /obs-store/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.styl/,
                    exclude: [/node_modules/],
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            'css-loader?modules,localIdentName="[name]-[local]-[hash:base64:6]"',
                            'stylus-loader?sourceMap'
                        ]
                    }),
                }
            ]
        },
        plugins,
        externals: {}
    };

    function onCompileEnd() {
        Object.entries(browserPlatforms).forEach(([platform, options]) => {
            copyFiles(platform, options);
        });
        console.log('Compiled build');
    }

};
