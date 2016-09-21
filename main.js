var Protoplast = require('./js/protoplast'),
    Collection = require('./js/collection'),
    CollectionView = require('./js/collection-view'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    Model = require('./js/model'),
    Object = require('./js/object'),
    utils = require('./js/utils'),
    constructors = require('./js/constructors');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    Dispatcher: Dispatcher,
    Context: Context,
    Component: Component,
    Model: Model,
    Object: Object,
    Collection: Collection,
    CollectionView: CollectionView,
    constructors: constructors,
    utils: utils
};

global.Protoplast = protoplast;
module.exports = protoplast;