const path = require('path'),
      commonConfig = require('./webpack.common.config'),
      merge = require("webpack-merge");

const config = {
    mode: 'development',
    entry: {
        'protoplast.test': './test-ts/protoplast.test.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'tmp')
    }
};

module.exports = merge(commonConfig, config);