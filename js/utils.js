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

    resolveProperty: binding.resolveProperty,
    bind: binding.bind,
    bindSetter: binding.bindSetter,
    bindProperty: binding.bindProperty,
    bindCollection: binding.bindCollection,

    renderList: component.renderList,
    createRendererFunction: component.createRendererFunction,
    domProcessors: {
        injectElement: component.domProcessors.injectElement,
        createComponents: component.domProcessors.createComponents
    },
    
    html: html
};
