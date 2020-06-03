const path = require('path');
const webpack = require('webpack');

module.exports = (env = {}) => {

    const isProduction  = env.production || true,
          isDevelopment = !isProduction,
          outputSuffix  = isProduction ? '' : '-debug',
          outputPath    = path.resolve(__dirname, 'build');

    let webpackPlugins = [
        new webpack.NoEmitOnErrorsPlugin(),
    ];

    let babelPlugins = [
        '@babel/transform-runtime'
    ];

    if (isProduction) {
        webpackPlugins.push(
        );
    }

    return [
        {
            mode : 'development',
            optimization: {
                minimize: true
            },

            entry : {
                main : './main.js',
                integration : './tests/integration.js'
            },

            output : {
                path          : outputPath,
                filename      : '[name]' + outputSuffix + '.js',
                library       : 'DecolsOrder',
                libraryTarget : 'umd'
            },

            // devtool : isDevelopment ? 'source-map' : null,

            plugins : webpackPlugins,

            module : {
                rules : [
                    {
                        test    : /\.js$/,
                        exclude : /node_modules/,
                        use     : {
                            loader  : 'babel-loader',
                            options : {
                                plugins : babelPlugins,

                                // presets : [ 'es2015' ],
                                presets : [
                                    [
                                        "@babel/env",
                                        {
                                            "targets" : { "browsers" : [ "ie 11" ] },
                                            modules     : false,
                                            "debug": true,
                                            "corejs": {
                                                "version": "3.6",
                                                "proposals": true
                                            },
                                            "useBuiltIns": "usage"
                                        }
                                    ]
                                ]
                            }
                        }
                    }
                ]
            }
        }
    ];
};
