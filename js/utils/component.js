var binding = require("./binding");

/**
 * Inject Element processor. Parses the template for elements with [data-prop] and injects the element to the
 * property passed as the value of the data-prop attribute. If a wrapper is defined the element is wrapped before
 * setting on the component
 */
var injectElement = {
    attribute: "data-prop",
    process: function(component, element, value) {
        (function(element){
            component[value] = element;
            if (component.$meta.elementWrapper) {
                component[value] = component.$meta.elementWrapper(component[value]);
            }
            else if (component.$meta.elementWrapperFunctionName) {
                component[value] = component[component.$meta.elementWrapperFunctionName](component[value]);
            }
        })(element);
    }
};

/**
 * Create Component processor. Replaces an element annotated with data-comp attribute with a component set in a property
 * of name passes as the value of the attribute, example
 * <div data-comp="foo"></div>
 */
var createComponents = {
    attribute: "data-comp",
    process: function(component, element, value) {
        var child = component[value] = component.$meta.properties.component[value].create();
        component.attach(child, element, element.parentNode);
    }
};

var renderListDefaultOptions = {
    remove: function(parent, child) {
        parent.remove(child);
    },
    create: function(parent, data, renderer, propertyName) {
        var child = renderer.create();
        child[propertyName] = data;
        parent.add(child);
    },
    update: function(child, item, propertyName) {
        child[propertyName] = item;
    }
};

var validateRenderingOptions = function(opts) {
    opts = opts || {};
    opts.create = opts.create || renderListDefaultOptions.create;
    opts.remove = opts.remove || renderListDefaultOptions.remove;
    opts.update = opts.update || renderListDefaultOptions.update;
    opts.property = opts.property || "data";
    if (!opts.renderer) {
        throw new Error("Renderer is required");
    }
    return opts;
};

var createRendererFunction = function(host, opts) {

    opts = validateRenderingOptions(opts);

    return function(list) {
        var max = Math.max(this.children.length, list.length),
            children = this.children.concat();

        for (var i = 0; i < max; i++) {
            if (children[i] && list.toArray()[i]) {
                opts.update(children[i], list.toArray()[i], opts.property);
            }
            else if (!children[i]) {
                opts.create(this, list.toArray()[i], opts.renderer, opts.property);
            }
            else if (!list.toArray()[i]) {
                opts.remove(this, children[i]);
            }
        }
    }.bind(host);
};

var renderList = function(host, sourceChain, opts) {
    var rendererFunction = createRendererFunction(opts.parent || host, opts);
    binding.bindCollection(host, sourceChain, rendererFunction);
};

module.exports = {
    createRendererFunction: createRendererFunction,
    renderList: renderList,
    renderListDefaults: renderListDefaultOptions,
    domProcessors: {
        injectElement: injectElement,
        createComponents: createComponents
    }
};