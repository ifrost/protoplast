const path = require('path');

module.exports = {
    entry: {
        'dist/protoplast': './main.js',
        'dist/protoplast.lean': './js/protoplast.js'
    },
    output: {
        filename: '[name].js',
        libraryTarget: "umd",
        library: 'Protoplast'
    }
};