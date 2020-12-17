const path = require('path');


module.exports = {
    mode: process.env.MODE || "development",
    entry: [
        "./dependents.js",
        "./dev.js"
    ],
    // entry: ["./BraceDiff/diffworker.js"],
    output: {
        path: path.join(__dirname, "."),
        filename: "./dist/absol-brace.js"
        // filename: "./dist/diffworker.js"
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
                test: /\.(tpl|txt|xml|rels|svg)$/i,
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
    }
};