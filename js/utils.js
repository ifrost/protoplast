var common = require('./utils/common'),
    binding = require('./utils/binding'),
    component = require('./utils/component'),
    html = require('./utils/html');

module.exports = {
    createObject: common.createObject,
    merge: common.merge,
    isLiteral: common.isLiteral,
    isPrimitive: common.isPrimitive,
    mixin: common.mixin,
    uniqueId: common.uniqueId,
    meta: common.meta,

    resolveProperty: binding.resolveProperty,
    bind: binding.bind,
    bindSetter: binding.bindSetter,
    bindProperty: binding.bindProperty,
    bindCollection: binding.bindCollection,
    observe: binding.observe,

    renderList: component.renderList,
    createRendererFunction: component.createRendererFunction,
    renderListDefaults: component.renderListDefaults,
    domProcessors: {
        injectElement: component.domProcessors.injectElement,
        createComponents: component.domProcessors.createComponents
    },
    
    html: html
};
