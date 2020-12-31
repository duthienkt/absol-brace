const path = require('path');

var packages = {
    default: {
        entry: [
            "./dev.js"
        ],
        filename: "./dist/absol-brace.js"
    },
    dependents: {
        entry: [
            "./dependents.js"
        ],
        filename: "./dist/absol.dependents.js"
    }
}

var buildPackage = packages[process.env.npm_lifecycle_event] || packages.default;

module.exports = {
    mode: process.env.MODE || "development",
    entry: buildPackage.entry,
    output: {
        path: path.join(__dirname, "."),
        filename: buildPackage.filename
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