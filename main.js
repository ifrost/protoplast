var Protoplast = require('./js/protoplast'),
    Aop = require('./js/aop'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    Dispatcher: Dispatcher,
    Aop: Aop,
    Context: Context,
    Component: Component
};

global.Protoplast = protoplast;
module.exports = protoplast;