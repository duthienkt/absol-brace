const path = require('path');
const webpack = require('webpack');
const os = require('os');
const fs = require('fs');

var package = Object.assign({}, require("./package.json"));
package.buildPCName = os.hostname();
package.buildFolder = __dirname;
package.buildTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

delete package.scripts;
delete package.devDependencies;
delete package.main;


var packages = {
    default: {
        entry: [
            "./dev.js"
        ],
        filename: "./dist/absol-brace.js"
    },

    defaultx: {
        entry: [
            "./standardalone.js"
        ],
        filename: "./dist/absol-brace.min.js"
    },
    dependents: {
        entry: [
            "./dependents.js"
        ],
        filename: "./dist/absol.dependents.js"
    },
    'dist-worker':{
        entry: [
            "./BraceDiff/diffworker.js"
        ],
        filename: "./BraceDiff/diffworker.js.txt"
    }
}

console.log(process.env.npm_lifecycle_event)
var buildPackage = packages[process.env.npm_lifecycle_event] || packages.default;

module.exports = {
    mode: (process.env.MODE && false) || "development",
    // mode: 'production',
    entry: buildPackage.entry,
    // entry: ["./src/cookie.js"],
    output: {
        path: path.join(__dirname, "."),
        filename: buildPackage.filename
    },
    resolve: {
        modules: [
            path.join(__dirname, './node_modules')
        ],
        fallback: {
            fs: false,
            path: require.resolve("path-browserify"),
            buffer: require.resolve("buffer/"),
            "util": require.resolve("util/"),
            semver: false,
            "assert": require.resolve("assert/")
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                // exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [['@babel/preset-env', {modules: false}]],
                    "plugins": [
                        ["@babel/plugin-transform-modules-commonjs",
                            {
                                "importInterop": "babel"
                            },
                        ],
                        "@babel/plugin-transform-spread"]
                }
            },
            {
                test: /\.(tpl|txt|xml|rels|svg)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', {loader: 'css-loader', options: {url: true}}]
            }
        ]
    },
    optimization: {
        // We do not want to minimize our code.
        minimize: false
    },
    devServer: {
        compress: false,
        disableHostCheck: true,
        host: '0.0.0.0',
        // https: https
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.DefinePlugin({
            PACKAGE: JSON.stringify(package)
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ]
};
