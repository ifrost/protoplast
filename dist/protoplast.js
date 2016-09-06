(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.p = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Model = require('./model');

var CollectionView = Model.extend({

    _filters: null,

    _sort: null,

    _hidden_selected: null,
    
    selected: null,

    length: {
        get: function() {
            return this._current.length;
        }
    },

    $create: function(collection) {
        this._source = collection;
        this._current = [];
        this._filters = [];
        this._sort = [];

        this._source.on('changed', this._invalidate, this);

        this.refresh = this.refresh.bind(this);

        this._invalidate({
            added: this._source.toArray()
        });
    },

    refresh: function() {
        this._invalidate();
    },

    add_filter: function(filter) {
        this._filters.push(filter);
        this._invalidate();
    },

    remove_filter: function(filter) {
        var index = this._filters.indexOf(filter);
        if (index !== -1) {
            this._filters.splice(index, 1);
            this._invalidate();
        }
    },

    add_sort: function(sort) {
        this._sort.push(sort);
        this._invalidate();
    },

    remove_sort: function(sort) {
        var index = this._sort.indexOf(sort);
        if (index !== -1) {
            this._sort.splice(index, 1);
        }
    },

    get: function(index) {
        return this._current[index];
    },

    toArray: function() {
        return this._current
    },

    concat: function() {
        return this._current.concat.apply(this._current, arguments);
    },

    forEach: function() {
        return this._current.forEach.apply(this._current, arguments);
    },

    _resubscribe: function(filter_or_sort, event) {
        event.removed.forEach(function(item) {
            if (filter_or_sort.properties) {
                filter_or_sort.properties.forEach(function(property) {
                    item.off(property + '_changed', this.refresh, this);
                }, this);
            }
        }, this);

        event.added.forEach(function(item) {
            if (filter_or_sort.properties) {
                filter_or_sort.properties.forEach(function(property) {
                    item.on(property + '_changed', this.refresh, this);
                }, this);
            }
        }, this);
    },

    _invalidate: function(event) {

        if (!event) {
            event = {added: this._source.toArray(), removed: this._source.toArray()}
        }

        this._current = this._source.toArray().concat();

        this._filters.forEach(function(filter) {
            this._resubscribe(filter, event);
            this._current = this._current.filter(function(item) {
                return filter.fn(item);
            });

        }, this);

        if (this._sort.length) {
            this._sort.forEach(function(sort) {
                this._resubscribe(sort, event);
            }, this);

            this._current.sort(function(a, b) {
                var sorts = this._sort.concat();
                var result = 0, sort = sorts.shift();
                
                while (result === 0 && sort) {
                    result = sort.fn(a, b);
                    sort = sorts.shift();
                }

                return result;
            }.bind(this));
        }
        
        if (this.selected && this._current.indexOf(this.selected) === -1) {
            this._hidden_selected = this.selected;
            this.selected = null;
        }
        else if (!this.selected && this._hidden_selected && this._current.indexOf(this._hidden_selected) !== -1) {
            this.selected = this._hidden_selected;
            this._hidden_selected = null;
        }
        
        this.dispatch('changed');
    }

});

module.exports = CollectionView;
},{"./model":7}],2:[function(require,module,exports){
var Model = require('./model');

var Collection = Model.extend({

    $create: function(array) {
        this.array = array || [];
    },

    length: {
        get: function() {
            return this.array.length;
        }
    },

    indexOf: function() {
        return this.array.indexOf.apply(this.array, arguments);
    },

    add: function(item) {
        var result = this.array.push(item);
        this.dispatch('changed', {added: [item], removed: []});
        return result;
    },
    
    remove: function(item) {
        var index = this.array.indexOf(item);
        if (index !== -1) {
            this.array.splice(index, 1);
            this.dispatch('changed', {added: [], removed: [item]});
        }
    },

    forEach: function(handler, context) {
        return this.array.forEach(handler, context);
    },
    
    concat: function() {
        return Collection.create(this.array.concat.apply(this.array, arguments));
    },

    filter: function(handler, context) {
        return Collection.create(this.array.filter(handler, context));
    },

    toArray: function() {
        return this.array;
    },

    toJSON: function() {
        return this.toArray();
    }

});

module.exports = Collection;
},{"./model":7}],3:[function(require,module,exports){
var Model = require('./model'),
    utils = require('./utils');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Model.extend({

    $meta: {
        dom_processors: [utils.dom_processors.create_component, utils.dom_processors.inject_element]
    },
    
    tag: '',

    html: '',

    root: {
        get: function() {
            return this._root;
        },
        set: function(value) {
            this._root = value;
            this.process_root();
        }
    },

    children: {
        get: function() {
            return this._children
        }
    },

    /**
     * Init the object, construct and process DOM
     */
    $create: function() {
        this._children = [];

        if (!this.tag && !this.html) {
            this.tag = 'div';
        }

        if (this.tag && !this.html) {
            this.html = '<' + this.tag + '></' + this.tag + '>';
        }

        var container = document.createElement('div');
        container.innerHTML = this.html;
        this.root = container.firstChild;
    },

    /**
     * Process DOM using defined DOM processors
     */
    process_root: function() {
        var i, elements, element, value;
        if (this._root) {
            (this.$meta.dom_processors || []).forEach(function(processor) {
                elements =  this._root.querySelectorAll('[' + processor.attribute + ']');
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    value = element.getAttribute(processor.attribute);
                    processor.process(this, element, value);
                }
            }, this);
        }
    },

    __fastinject__: {
        get: function() {return this.___fastinject___},
        set: function(value) {
            if (!this.___fastinject___) {
                this.___fastinject___ = value;
                // fastinject all the children
                this._children.forEach(this.__fastinject__, this);

                if (this.$meta.presenter) {
                    this.__presenter__ = this.$meta.presenter.create();
                }

            }
        }
    },

    __presenter__: {
        get: function() {
            return this.___presenter___;
        },
        set: function(presenter) {
            this.___presenter___ = presenter;
            presenter.view = this;
            this.___fastinject___(presenter);
        }
    },

    /**
     * Template method, used to create DOM of the component
     */
    init: {
        inject_init: true,
        value: function() {}
    },

    /**
     * Destroy the component and all child components
     */
    destroy: function() {
        if (this.__presenter__ && this.__presenter__.destroy) {
            this.__presenter__.destroy();
        }
        this._children.concat().forEach(function(child) {
            this.remove(child);
        }, this);
    },

    /**
     * Add a child component
     * @param {Component} child
     */
    add: function(child) {
        if (!child) {
            throw new Error('Child component cannot be null');
        }
        if (!child.root) {
            throw new Error('Child component should have root property');
        }
        this._children.push(child);
        if (this.__fastinject__) {
            this.__fastinject__(child);
        } // otherwise it will be injected when __fastinject__ is set
        this.root.appendChild(child.root);
    },

    /**
     * Remove child component
     * @param {Component} child
     */
    remove: function(child) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            this.root.removeChild(child.root);
            child.destroy();
        }
    },

    /**
     * Attaches a component by replacing the provided element. Element must be an element inside the parent component.
     * @param {Component} child
     * @param {Element} element
     */
    attach: function(child, element) {
        this._children.push(child);
        this.root.insertBefore(child.root, element);
        this.root.removeChild(element);
    }
});

/**
 *
 * @param {HTMLElement} element
 * @param {Context} [context]
 * @returns {Component}
 * @constructor
 */
Component.Root = function(element, context) {
    var component = Component.create();
    component.root = element;
    if (context) {
        context.register(component);
    }
    return component;
};

module.exports = Component;


},{"./model":7,"./utils":9}],4:[function(require,module,exports){
var utils = require('./utils');

/**
 * Collection of constructors
 */
var constructors = {

    /**
     * Add unique id to the object
     */
    uniqueId: function() {
        this.$id = utils.uniqueId(this.$meta.$prefix);
    },

    /**
     * Bind all the function to the instance
     */
    autobind: function () {
        for (var property in this) {
            if (typeof(this[property]) === "function") {
                this[property] = this[property].bind(this);
            }
        }
    }

};

module.exports = constructors;
},{"./utils":9}],5:[function(require,module,exports){

var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher');

/**
 * Dependency Injection context builder
 * @type {Object}
 */
var Context = Protoplast.extend({

    $create: function() {
        var self = this;
        this._objects = {
            pub: function(topic, message) {
                self._dispatcher.dispatch(topic, message);
            },
            sub: function(topic) {
                var instance_self = this;
                return {
                    add: function(handler) {
                        self._dispatcher.on(topic, handler, instance_self);
                    },
                    remove: function(handler) {
                        self._dispatcher.off(topic, handler, instance_self);
                    }
                };
            }
        };
        this._unknows = [];

        this._dispatcher = Dispatcher.create();
    },

    /**
     * Map of object in the context
     * @type {Object}
     * @private
     */
    _objects: null,

    /**
     * List of objects added to the registry but having no id
     */
    _unknows: null,

    /**
     * Registers object in the DI context
     * @param {String} [id]
     * @param {Object} instance
     */
    register: function(id, instance) {
        if (arguments.length == 1) {
            instance = id;
            this._unknows.push(instance);
        }
        else {
            this._objects[id] = instance;
        }

        // fast inject is used to register and process new objects after the config has been built
        // any object registered in the config has this method.
        instance.__fastinject__ = function(obj) {
            this.register(obj);
            this.process(obj);
        }.bind(this);
        
    },

    process: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.inject) {
            Object.keys(obj.$meta.properties.inject).forEach(function(property){
                obj[property] = this._objects[obj.$meta.properties.inject[property]];
            }, this);
        }
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.inject_init) {
            Object.keys(obj.$meta.properties.inject_init).forEach(function(handler){
                obj[handler]();
            }, this);
        }
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.sub) {
            Object.keys(obj.$meta.properties.sub).forEach(function(handler){
                this._objects.sub.call(obj, obj.$meta.properties.sub[handler]).add(obj[handler]);
            }, this);
        }
    },

    /**
     * Defines getters for injected properties. The getter returns instance from the config
     * @param {Object} instance
     * @param {Object} config - {property:dependencyId,...}
     */

    /**
     * Process all objects
     */
    build: function() {
        Object.keys(this._objects).forEach(function(id) {
            var instance = this._objects[id];
            this.process(instance);
        }, this);
        this._unknows.forEach(function(instance){
            this.process(instance);
        }, this);
    }

});

module.exports = Context;


},{"./dispatcher":6,"./protoplast":8}],6:[function(require,module,exports){

var Protoplast = require('./protoplast');

/**
 * EventDispatcher implementation, can be used as mixin or base protoype
 * @type {Function}
 */
var Dispatcher = Protoplast.extend({

    $create: function() {
        this._topics = {};
    },

    dispatch: function(topic) {
        var args = Array.prototype.slice.call(arguments, 1);
        (this._topics[topic] || []).forEach(function(config) {
            config.handler.apply(config.context, args);
        })
    },

    on: function(topic, handler, context) {
        if (!handler) {
            throw new Error('Handler is required for event ' + topic);
        }
        this._topics[topic] = this._topics[topic] || [];
        this._topics[topic].push({handler: handler, context: context});
    },

    off: function(topic, handler, context) {
        this._topics[topic] = (this._topics[topic] || []).filter(function(config) {
            return handler ? config.handler !== handler : config.context !== context
        })
    }
});

module.exports = Dispatcher;

},{"./protoplast":8}],7:[function(require,module,exports){
var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher'),
    utils = require('./utils');

function define_computed_property(name, desc) {
    var calc = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        if (this['_' + name] === undefined) {
            this['_' + name] = calc.call(this);
        }
        return this['_' + name];
    };

    desc.set = function() {
        var old = this['_' + name];
        this['_' + name] = undefined;
        this.dispatch(name + '_changed', undefined, old);
    }
}

function define_bindable_property(name, desc, proto) {
    var initial_value = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        return this['_' + name];
    };
    desc.set = function(value) {
        if (value !== this['_' + name]) {
            var old = this['_' + name];
            this['_' + name] = value;
            this.dispatch(name + '_changed', value, old);
        }
    };
    proto['_' + name] = initial_value;
}

var define_properties = {
    def: function(name, desc, proto) {
        if (proto.$meta.properties.computed && proto.$meta.properties.computed[name]) {
            define_computed_property(name, desc);
        }
        else if (!desc.get || ['number', 'boolean', 'string'].indexOf(typeof(desc.value)) !== -1) {
            define_bindable_property(name, desc, proto);
        }
    }
};

var Model = Protoplast.extend([Dispatcher], {

    $meta: {
        hooks: [define_properties]
    },
    
    $create: function() {
        for (var computed_property in this.$meta.properties.computed) {
            this.$meta.properties.computed[computed_property].forEach(function(chain) {
                (function(){
                    utils.bind(this, chain, function() {
                        this[computed_property] = undefined;
                    }.bind(this));
                }.bind(this))(computed_property);
            }, this);
        }
    }

});

module.exports = Model;
},{"./dispatcher":6,"./protoplast":8,"./utils":9}],8:[function(require,module,exports){
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
 * @param [mixins]     list of mixins to merge with
 * @param description  object description
 * @returns {Object}
 */
Protoplast.extend = function(mixins, description) {
    var proto = Object.create(this), meta, mixins_meta, desc, defined;

    // normalise parameters
    if (!(mixins instanceof Array)) {
        description = mixins;
        mixins = [];
    }
    description = description || {};
    mixins = mixins || [];
    
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
    
    return proto;
};

global.Protoplast = Protoplast;
module.exports = Protoplast;



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils":9}],9:[function(require,module,exports){
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

},{"./utils/binding":10,"./utils/common":11,"./utils/component":12}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{"./binding":10}],13:[function(require,module,exports){
(function (global){
var Protoplast = require('./js/protoplast'),
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./js/collection":2,"./js/collection-view":1,"./js/component":3,"./js/constructors":4,"./js/di":5,"./js/dispatcher":6,"./js/model":7,"./js/protoplast":8,"./js/utils":9}]},{},[13])(13)
});