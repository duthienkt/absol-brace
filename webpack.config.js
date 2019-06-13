const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

var demo_src = process.env.DEMO;

module.exports = {
    mode: process.env.MODE || "development",
    entry: ["./index.js"],
    output: {
        path: path.join(__dirname, "."),
        filename: "./dist/absol-brace.js"
    },
    resolve: {
        modules: [
            './node_modules'
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env"]//,
                    // plugins: [
                    //     'transform-jsx-to-absol'
                    //     // ,
                    //     // '@babel/transform-literals'
                    // ]
                }
            },
            {
                test: /\.(tpl|txt|xml|rels)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    devServer: {
        compress: true
    },
    performance: {
        hints: false
    },
    plugins: [
        new MinifyPlugin()
    ]
};