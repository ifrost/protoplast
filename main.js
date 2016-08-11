var Protoplast = require('./js/protoplast'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    Model = require('./js/model'),
    TagComponent = require('./js/tag-component'),
    utils = require('./js/utils'),
    constructors = require('./js/constructors');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    Dispatcher: Dispatcher,
    Context: Context,
    Component: Component,
    Model: Model,
    TagComponent: TagComponent,
    constructors: constructors,
    utils: utils
};

global.Protoplast = protoplast;
module.exports = protoplast;