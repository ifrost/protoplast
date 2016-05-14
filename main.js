var Protoplast = require('./js/protoplast'),
    Aop = require('./js/aop'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    utils = require('./js/utils'),
    constructors = require('./js/constructors');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    Dispatcher: Dispatcher,
    Aop: Aop,
    Context: Context,
    Component: Component,
    constructors: constructors,
    utils: utils
};

module.exports = protoplast;