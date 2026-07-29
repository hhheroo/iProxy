'use strict';

const path = require('path');

module.exports = {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, '../app/dist'),
        filename: '[name].js',
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.[mc]?[jt]sx?$/,
                loader: 'esbuild-loader',
                options: {
                    target: 'es2019',
                },
            },
        ],
    },
    devtool: 'source-map',
    plugins: [],
};
