(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.p = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var utils = require('./utils');

/**
 * Base protoplast
 */
var Protoplast = {
    $meta: {},
    create: function() {
        return utils.createObject(this, arguments);
    }
};

/**
 * Creates new factory function
 * @param [mixins]
 * @param description
 * @returns {Object}
 */
Protoplast.extend = function(mixins, description) {
    var proto = Object.create(this), meta, mixins_meta, desc, defined, property_hooks = [];

    // set defaults
    if (!(mixins instanceof Array)) {
        description = mixins;
        mixins = [];
    }
    description = description || {};
    mixins = mixins || [];

    if (description.$meta && description.$meta.hooks) {
        description.$meta.hooks.forEach(function(hook) {
            if (hook.desc) {
                hook.desc(description);
            }
        });
    }

    meta = description.$meta || {};
    meta.properties = meta.properties || {};

    delete description.$meta;

    if (description.$create !== undefined) {
        meta.constructors = meta.constructors || [];
        meta.constructors.push(description.$create);
        delete description.$create;
    }

    proto = utils.mixin(proto, mixins);

    var property_definitions = [];

    for (var property in description) {
        defined = false;

        if (description[property] && description[property].hooks) {
            (function(property, desc){
                description[property].hooks.forEach(function(hook) {
                    if (hook.desc) {
                        hook.desc(proto, property, desc);
                    }
                    if (hook.proto) {
                        (function(fn) {
                            property_hooks.push(function(proto) {
                                proto[property] = (fn(proto[property], property, proto));
                            });
                        }(hook.proto));
                    }
                    if (hook.instance) {
                        meta.constructors = meta.constructors || [];
                        meta.constructors.push(function() {
                            this[property] = (hook.instance(this[property], property, proto, this));
                        });
                    }
                });
            }(property, description[property]));
        }

        if (Object.prototype.toString.call(description[property]) !== "[object Object]") {
            defined = true;
            desc = {value: description[property], writable: true, enumerable: true, configurable: true};
        } else {
            desc = description[property];
            if (!(property in this) && !desc.set && !desc.get && !desc.value) {
                desc.value = null;
            }
            for (var d in desc) {
                if (['value', 'get', 'set', 'writable', 'enumerable', 'configurable'].indexOf(d) === -1) {
                    meta.properties[d] = meta.properties[d] || {};
                    meta.properties[d][property] = desc[d];
                    delete desc[d];
                }
                else {
                    defined = true;
                }
            }
            if (!desc.hasOwnProperty('writable') && !desc.hasOwnProperty('set') && !desc.hasOwnProperty('get')) {
                desc.writable = true;
            }
            if (!desc.hasOwnProperty('enumerable')) {
                desc.enumerable = true;
            }
            if (!desc.hasOwnProperty('configurable')) {
                desc.configurable = true;
            }
        }
        if (defined) {
            property_definitions.push({
                property : property,
                desc: desc
            });
        }
    }

    mixins_meta = (mixins || []).reduce(function(current, next) {
        return utils.merge(current, next.$meta);
    }, {});
    meta = utils.merge(meta, mixins_meta);
    proto.$meta = utils.merge(meta, this.$meta);

    property_definitions.forEach(function(definition) {
        var property = definition.property,
            desc = definition.desc;

        if (proto.$meta && proto.$meta.hooks) {
            proto.$meta.hooks.forEach(function(hook) {
                if (hook.def) {
                    hook.def(property, desc, proto);
                }
            });
        }
        Object.defineProperty(proto, property, desc);
    });

    property_hooks.forEach(function(property_processor) {
        property_processor(proto);
    });

    (proto.$meta.hooks || []).forEach(function(hook) {
        if (hook.proto) {
            hook.proto(proto);
        }
    });

    return proto;
};

global.Protoplast = Protoplast;
module.exports = Protoplast;



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils":2}],2:[function(require,module,exports){
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

},{"./utils/binding":3,"./utils/common":4,"./utils/component":5}],3:[function(require,module,exports){
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

var bind_setter = function(host, chain, handler) {
    var props = chain.split('.');

    if (props.length === 1) {
        host.on(chain + '_changed', handler);
        handler(host[chain]);
    }
    else {
        var sub_host = host[props[0]];
        var sub_chain = props.slice(1).join('.');
        if (sub_host) {
            bind_setter(sub_host, sub_chain, function() {
                resolve_property(sub_host, sub_chain, handler);
            });
        }
        host.on(props[0] + '_changed', function(_, previous) {
            if (previous && previous.on) {
                previous.off(props[0] + '_changed', handler);
            }
            bind_setter(host[props[0]], sub_chain, handler);
        });
    }

};

var bind_collection = function(host, source_chain, handler) {

    var previous_list = null, previous_handler;

    bind_setter(host, source_chain, function() {
        resolve_property(host, source_chain, function(list) {
            if (previous_list) {
                if (previous_list.off) {
                    previous_list.off('changed', previous_handler);
                }
                previous_list = null;
                previous_handler = null
            }
            if (list) {
                previous_list = list;
                previous_handler = handler.bind(host, list);
                if (list.on) {
                    list.on('changed', previous_handler);
                }
            }
            handler(list);
        });
    });

};

var bind = function(host, bindings_or_chain, handler) {
    var handlers_list;
    if (arguments.length === 3) {
        bind_collection(host, bindings_or_chain, handler);
    }
    else {
        for (var binding in bindings_or_chain) {
            handlers_list = bindings_or_chain[binding];
            if (!(handlers_list instanceof Array)) {
                handlers_list = [handlers_list];
            }
            handlers_list.forEach(function(handler) {
                bind(host, binding, handler.bind(host));
            });
        }
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

module.exports = {
    resolve_property: resolve_property,
    bind: bind,
    bind_setter: bind_setter,
    bind_property: bind_property,
    bind_collection: bind_collection
};
},{}],4:[function(require,module,exports){
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

module.exports = {
    createObject: createObject,
    merge: merge,
    mixin: mixin,
    uniqueId: uniqueId
};
},{}],5:[function(require,module,exports){
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
},{"./binding":3}]},{},[1])(1)
});