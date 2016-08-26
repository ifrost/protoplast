var Protoplast = require('./js/protoplast'),
    App = require('./js/app'),
    Collection = require('./js/collection'),
    CollectionView = require('./js/collection-view'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    Model = require('./js/model'),
    utils = require('./js/utils'),
    constructors = require('./js/constructors');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    App: App,
    Dispatcher: Dispatcher,
    Context: Context,
    Component: Component,
    Model: Model,
    Collection: Collection,
    CollectionView: CollectionView,
    constructors: constructors,
    utils: utils
};

global.Protoplast = protoplast;
module.exports = protoplast;