const path = require('path'),
      commonConfig = require('./webpack.common.config');

const config = {
    entry: {
        'protoplast': './main.js',
        'protoplast.lean': './js/protoplast.js'
    },
    devtool: 'inline-source-map',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "umd",
        library: 'Protoplast'
    }
};

module.exports = { ...commonConfig, ...config }