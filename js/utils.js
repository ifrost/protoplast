var idCounter = 0;

/**
 * Generate a unique id prefixed with prefix if defined
 * @param {String} prefix
 * @returns {String}
 */
function uniqueId(prefix) {
    var id = ++idCounter;
    return (prefix || '') + id;
}

/**
 * Create an object for the prototype
 * @param {Object} proto
 * @param {Object[]} args
 * @returns {Object}
 */
function createObject(proto, args) {
    var instance = Object.create(proto);
    if (instance.$meta.constructors) {
        instance.$meta.constructors.forEach(function(constructor){
            constructor.apply(instance, args);
        });
    }
    return instance;
}

/**
 * Merges source object into destination. Arrays are concatenated, primitives taken from the source if not
 * defined and complex object merged recursively
 * @param destination
 * @param source
 * @returns {Object}
 */
function merge(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            if (source[property] instanceof Array) {
                destination[property] = source[property].concat(destination[property] || []);
            }
            else if (['number', 'boolean', 'string', 'function'].indexOf(typeof(source[property])) !== -1) {
                if (!destination.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
            else {
                destination[property] = destination[property] || {};
                merge(destination[property], source[property]);
            }
        }
    }
    return destination;
}

/**
 * Mixes mixin source properties into destination object unless the property starts with __
 * @param {Object} destination
 * @param {Object} source
 * @returns {Object}
 */
function mix(destination, source) {
    for (var property in source) {
        if (property.substr(0, 2) !== '__') {
            destination[property] = source[property];
        }
    }
    return destination;
}

/**
 * Mixes all mixins into the instance
 * @param {Object} instance
 * @param {Object[]} mixins
 * @returns {Object}
 */
function mixin(instance, mixins) {
    mixins.forEach(function(Mixin) {
        mix(instance, Mixin);
    });
    return instance;
}


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

var resolve_property = function(host, chain, handler) {
    var props = chain.split('.');

    if (!chain) {
        handler(host);
    }
    else if (props.length === 1) {
        handler(host[chain]);
    }
    else {
        var sub_host = host[props[0]];
        var sub_chain = props.slice(1).join('.');
        if (sub_host) {
            resolve_property(sub_host, sub_chain, handler);
        }
    }
    
};

var bind = function(host, chain, handler) {
    var props = chain.split('.');

    if (props.length === 1) {
        host.on(chain + '_changed', handler);
        handler(host[chain]);
    }
    else {
        var sub_host = host[props[0]];
        var sub_chain = props.slice(1).join('.');
        if (sub_host) {
            bind(sub_host, sub_chain, function() {
                resolve_property(sub_host, sub_chain, handler);
            });
        }
        host.on(props[0] + '_changed', function(_, previous) {
            if (previous && previous.on) {
                previous.off(props[0] + '_changed', handler);
            }
            bind(host[props[0]], sub_chain, handler);
        });
    }

};

var bind_property = function(host, host_chain, dest, dest_chain) {

    var props = dest_chain.split('.');
    var prop = props.pop();

    bind(host, host_chain, function() {
        resolve_property(host, host_chain, function(value) {
            resolve_property(dest, props.join('.'), function(final_object) {
                if (final_object) {
                    final_object[prop] = value;
                }
            })
        })
    });

};

var bind_collection = function(host, source_chain, handler) {

    var previous_list = null, previous_handler;

    bind(host, source_chain, function() {
        resolve_property(host, source_chain, function(list) {
            if (previous_list) {
                previous_list.off('changed', previous_handler);
                previous_list = null;
                previous_handler = null
            }
            if (list) {
                previous_list = list;
                previous_handler = handler.bind(host, list);
                list.on('changed', previous_handler);
                handler(list);
            }
        });
    });

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
        var max = Math.max(this._children.length, list.length),
            children = this._children.concat();

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
    bind_collection(host, source_chain, renderer_function);
};

var dom_processors = {
    inject_element: inject_element,
    create_component: create_component
};

module.exports = {
    createObject: createObject,
    merge: merge,
    mixin: mixin,
    uniqueId: uniqueId,
    dom_processors: dom_processors,
    resolve_property: resolve_property,
    bind: bind,
    bind_property: bind_property,
    bind_collection: bind_collection,
    render_list: render_list,
    create_renderer_function: create_renderer_function
};