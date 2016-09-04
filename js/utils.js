var common = require('./utils/common'),
    binding = require('./utils/binding'),
    component = require('./utils/component');

module.exports = {
    createObject: common.createObject,
    merge: common.merge,
    mixin: common.mixin,
    uniqueId: common.uniqueId,

    resolve_property: binding.resolve_property,
    bind: binding.bind,
    bind_property: binding.bind_property,
    bind_collection: binding.bind_collection,

    render_list: component.render_list,
    create_renderer_function: component.create_renderer_function,
    dom_processors: {
        inject_element: component.dom_processors.inject_element,
        create_component: component.dom_processors.create_component
    }
};
