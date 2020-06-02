const RELEASE     = 1;
const DEVELOPMENT = 2;

const path = require('path');
const webpack = require('webpack');

module.exports = (env = {}) => {

    const isProduction  = env.production || false,
          isDevelopment = !isProduction,
          outputSuffix  = isProduction ? '' : '-debug',
          outputPath    = path.resolve(__dirname, 'build');

    let webpackPlugins = [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            "TARGET"      : isProduction ? RELEASE : DEVELOPMENT,
            "DEVELOPMENT" : DEVELOPMENT,
            "RELEASE"     : RELEASE
        })
    ];

    let babelPlugins = [
        '@babel/transform-runtime'
    ];

    if (isProduction) {
        webpackPlugins.push(
            // new webpack.optimize.UglifyJsPlugin({
            //     uglifyOptions : {
            //         compress : true,
            //         warnings : false
            //     }
            // })
        );
    }

    return [
        {
            mode : 'development',

            entry : {
                engine : './main.js'
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
                                            "targets" : { "browsers" : [ "ie 9" ] },
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
