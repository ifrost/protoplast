var binding = require('./binding');

/**
 * Inject Element processor. Parses the template for elements with [data-prop] and injects the element to the
 * property passed as the value of the data-prop attribute. If a wrapper is defined the element is wrapped before
 * setting on the component
 */
var inject_element = {
    attribute: 'data-prop',
    process: function(component, element, value) {
        (function(element){
            component[value] = element;
            if (component.$meta.element_wrapper) {
                component[value] = component.$meta.element_wrapper(component[value]);
            }
        })(element);
    }
};

/**
 * Create Component processor. Replaces an element annotated with data-comp attribute with a component set in a property
 * of name passes as the value of the attribute, example
 * <div data-comp="foo"></div>
 */
var create_component = {
    attribute: 'data-comp',
    process: function(component, element, value) {
        var child = component[value] = component.$meta.properties.component[value].create();
        component.attach(child, element);
    }
};

var render_list_default_options = {
    remove: function(parent, child) {
        parent.remove(child);
    },
    create: function(parent, data, renderer, property_name) {
        var child = renderer.create();
        child[property_name] = data;
        parent.add(child);
    },
    update: function(child, item, property_name) {
        child[property_name] = item;
    }
};

var create_renderer_function = function(host, opts) {

    opts = opts || {};
    opts.create = opts.create || render_list_default_options.create;
    opts.remove = opts.remove || render_list_default_options.remove;
    opts.update = opts.update || render_list_default_options.update;
    opts.renderer_data_property = opts.renderer_data_property || 'data';
    if (!opts.renderer) {
        throw new Error('Renderer is required')
    }

    return function(list) {
        var max = Math.max(this.children.length, list.length),
            children = this.children.concat();

        for (var i = 0; i < max; i++) {
            if (children[i] && list.toArray()[i]) {
                opts.update(children[i], list.toArray()[i], opts.renderer_data_property);
            }
            else if (!children[i]) {
                opts.create(this, list.toArray()[i], opts.renderer, opts.renderer_data_property);
            }
            else if (!list.toArray()[i]) {
                opts.remove(this, children[i]);
            }
        }
    }.bind(host);
};

var render_list = function(host, source_chain, opts) {
    var renderer_function = create_renderer_function(host, opts);
    binding.bind_collection(host, source_chain, renderer_function);
};

module.exports = {
    create_renderer_function: create_renderer_function,
    render_list: render_list,
    dom_processors: {
        inject_element: inject_element,
        create_component: create_component
    }
};