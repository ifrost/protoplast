var common = require('./utils/common'),
    binding = require('./utils/binding'),
    component = require('./utils/component');

module.exports = {
    createObject: common.createObject,
    merge: common.merge,
    mixin: common.mixin,
    uniqueId: common.uniqueId,

    resolveProperty: binding.resolveProperty,
    bind: binding.bind,
    bindProperty: binding.bindProperty,
    bindCollection: binding.bindCollection,

    renderList: component.renderList,
    createRendererFunction: component.createRendererFunction,
    domProcessors: {
        injectElement: component.domProcessors.injectElement,
        createComponents: component.domProcessors.createComponents
    }
};
