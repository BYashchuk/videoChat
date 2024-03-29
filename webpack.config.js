const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
require("dotenv").config();

var configFunc = function(){
    var config = {
        devtool: "source-map",
        entry: __dirname + "/app/app.js",
        output: {
            path: __dirname + "/dist",
            filename: "bundle.js",
            publicPath: "/"
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [
                      {
                        loader: 'babel-loader',
                        options: {
                          presets: ['react']
                        }
                      }
                    ],
                  },
                {
                    test: /\.(sass|scss|css)$/,
                    use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        }
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                hash: true,
                template: __dirname + "/app/index.html",
                inject: "body"
            }),
            new webpack.BannerPlugin("React Twilio"),
            new ExtractTextPlugin("[name]-[hash].cssi")
        ]};
    if(process.env.NODE_ENV === "PROD") {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
        config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
            name: "commons",              
            filename: "commons.js"
        }));
    }
    return config;
}();

module.exports = configFunc;
