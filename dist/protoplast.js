(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.p = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Protoplast = require('./protoplast'),
    Component = require('./component'),
    Context = require('./di');

var App = Protoplast.extend({

    config: null,

    context: null,

    $create: function() {
        this.context = Context.create();
    },

    start: function(config) {
        this.config = config;

        for (var name in this.config.context) {
            this.context.register(name, this.config.context[name]);
        }

        this.context.build();

        if (config.view && config.view.root) {
            this.root = Component.Root(config.view.root, this.context);
            if (config.view.top) {
                var tops = config.view.top.constructor === Array ? config.view.top : [config.view.top];
                tops.forEach(function(view) {
                    this.root.add(view);
                }, this);
            }
        }
    }

});

module.exports = App;
},{"./component":4,"./di":6,"./protoplast":9}],2:[function(require,module,exports){
var Model = require('./model');

var ModelArray = Model.extend({

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

    filter: function(handler, context) {
        return ModelArray.create(this.array.filter(handler, context));
    },

    toArray: function() {
        return this.array;
    },

    toJSON: function() {
        return this.toArray();
    }

});

module.exports = ModelArray;
},{"./model":8}],3:[function(require,module,exports){
var Model = require('./model');

var CollectionView = Model.extend({
   
    _filters: null,

    length: {
        get: function() {
            return this._current.length;
        }
    },

    $create: function(collection) {
        this._source = collection;
        this._current = [];
        this._filters = [];
        
        this._source.on('changed', this._invalidate, this);
        
        this._invalidate({
            added: this._source.toArray()
        });
    },
    
    add_filter: function(fn) {
        this._filters.push(fn);
        this._invalidate();
    },

    get: function(index) {
        return this._current[index];
    },

    toArray: function() {
        return this._current
    },
    
    _invalidate: function(event) {
        
        if (!event) {
            event = {added: this._source.toArray()}
        }
        
        this._current = this._source.toArray();
        
        this._filters.forEach(function(filter) {

            event.added.forEach(function(item){
                if (filter.properties) {
                    filter.properties.forEach(function(property) {
                        item.on(property + '_changed', this._invalidate.bind(this, undefined), this);
                    }, this);
                }
            }, this);
            
            this._current = this._current.filter(function(item) {
                return filter.fn(item);
            });
        }, this);

        this.dispatch('changed');
    }
    
});

module.exports = CollectionView;
},{"./model":8}],4:[function(require,module,exports){
var Model = require('./model'),
    utils = require('./utils');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Model.extend({

    __registry: {
        value: {}
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

    /**
     * Init the object, construct and process DOM
     */
    $create: function() {
        this._children = [];
        this._inlines = [];

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

    __fastinject__: {
        get: function() {return this.___fastinject___},
        set: function(value) {
            this.___fastinject___ = value;
            // fastinject all the children
            (this._children.concat(this._inlines)).forEach(this.__fastinject__, this);
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
        (this._children.concat(this._inlines)).forEach(function(child) {
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

    item_renderer: null,

    // data: {
    //     get: function() {
    //         return this._data;
    //     },
    //     set: function(data) {
    //
    //         this._data = data;
    //         this.update_data();
    //     }
    // },
    //
    // create_from_item_renderer: function(item) {
    //     var child = this.item_renderer(item);
    //     child.data = item;
    //     this.add(child);
    // },
    //
    // update_data: function() {
    //     if (this.item_renderer) {
    //
    //         var array = this._data;
    //
    //         this._children.forEach(this.remove, this);
    //         array.forEach(this.create_from_item_renderer, this);
    //
    //         if (array.on) {
    //             array.on('changed', function() {
    //
    //                 var max = Math.max(this._children.length, this.data.length),
    //                     children = this._children.concat();
    //
    //                 for (var i = 0; i < max; i++) {
    //                     if (children[i] && this.data.toArray()[i]) {
    //                         children[i].data = this.data.toArray()[i];
    //                     }
    //                     else if (!children[i]) {
    //                         this.create_from_item_renderer(this.data.toArray()[i]);
    //                     }
    //                     else if (!this.data.toArray()[i]) {
    //                         this.remove(children[i]);
    //                     }
    //                 }
    //
    //                 /**
    //
    //                 this._children.concat().forEach(function(child) {
    //                     if (this.data.indexOf(child.data) === -1) {
    //                         this.remove(child);
    //                     }
    //                 }, this);
    //
    //                 var child_items = this._children.map(function(child) {
    //                     return child.data;
    //                 });
    //
    //                 this.data.forEach(function(item) {
    //                     if (child_items.indexOf(item) === -1) {
    //                         this.create_from_item_renderer(item)
    //                     }
    //                 }, this);
    //
    //                  **/
    //
    //             }, this);
    //         }
    //     }
    // },

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
        this._inlines.push(child);
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


},{"./model":8,"./utils":11}],5:[function(require,module,exports){
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
},{"./utils":11}],6:[function(require,module,exports){

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

        instance.__fastinject__ = function(obj) {
            this.register(obj);
            this.process(obj);
        }.bind(this);

        if (instance.$meta && instance.$meta.properties && instance.$meta.properties.inject) {
            this.inject(instance, instance.$meta.properties.inject);
        }

    },

    process: function(obj) {
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
     * Performs dependency injection based on the config
     * @param {Object} instance
     * @param {Object} config - {property:dependencyId,...}
     */
    inject: function(instance, config) {
        var self = this, id;
        for (var property in config) {
            if (config.hasOwnProperty(property)) {
                id = config[property];

                (function(id) {
                    Object.defineProperty(instance, property, {
                        get: function() {
                            return self._objects[id];
                        }
                    });
                })(id);
            }
        }
    },

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


},{"./dispatcher":7,"./protoplast":9}],7:[function(require,module,exports){

var Protoplast = require('./protoplast');

/**
 * EventDispatcher implementation, can be used as mixin or base protoype
 * @type {Function}
 */
var Dispatcher = Protoplast.extend({

    $create: function() {
        this._topics = {};
    },

    dispatch: function(topic, message) {
        (this._topics[topic] || []).forEach(function(config) {
            config.handler.call(config.context, message);
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
        this._topics[topic] = this._topics[topic].filter(function(config) {
            return handler ? config.handler !== handler : config.context !== context
        })
    }
});

module.exports = Dispatcher;

},{"./protoplast":9}],8:[function(require,module,exports){
var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher'),
    utils = require('./utils');

var define_properties = {
    def: function(name, desc, proto) {
        if (proto.$meta.properties.computed && proto.$meta.properties.computed[name]) {
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
        else if (!desc.get && (!desc.value || ['number', 'boolean', 'string'].indexOf(typeof(desc.value)) !== -1)) {
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

    }
};

var Model = Protoplast.extend([Dispatcher], {

    $meta: {
        hooks: [define_properties]
    },

    invalidated_injected_bindings: {
        inject_init: true,
        value: function() {
            for (var computed_property in this.$meta.properties.inject) {
                this.dispatch(computed_property + '_changed');
            }
        }
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
},{"./dispatcher":7,"./protoplast":9,"./utils":11}],9:[function(require,module,exports){
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
},{"./utils":11}],10:[function(require,module,exports){
var Component = require('./component'),
    utils = require('./utils');


/**
 * Component with additional DOM processing
 */
var TagComponent = Component.extend({

    $meta: {
        dom_processors: [utils.dom_processors.create_component, utils.dom_processors.inject_element],
        hooks: [{
            proto: function(proto) {
                if (proto.$meta.tag) {
                    proto.__registry[proto.$meta.tag] = proto;
                }
            }
        }]
    },

    $create: function() {
        var init_func = this.init.bind(this);
        this.init = function() {
            init_func();
            if (this.$meta.presenter) {
                var presenter = this.$meta.presenter.create();
                var presenter_type = this.$meta.presenter_type || 'both';
                var presenter_property = this.$meta.presenter_property || 'presenter';
                var view_property = this.$meta.view_property || 'view';

                if (presenter_type === 'active' || presenter_type === 'both') {
                    presenter[view_property] = this;
                }
                if (presenter_type === 'passive' || presenter_type === 'both') {
                    this[presenter_property] = this;
                }
                this.presenter = presenter;
                this.___fastinject___(presenter);
                this.presenter_ready();
            }
        }
    },

    presenter_ready: function() {},

    process_root: function() {

        var elements, component, element;

        Component.process_root.call(this);

        elements = this._root.getElementsByTagName('*');
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            var tag = element.tagName ? element.tagName.toLowerCase() : '';
            if (tag && this.__registry[tag]) {
                component = this.__registry[tag].create();
                this.attach(component, element);
                if (element.getAttribute('data-id')) {
                    this[element.getAttribute('data-id')] = component;
                }
            }
        }

        for (var property in this.$meta.properties.$) {
            this[property] = this._root.querySelector(this.$meta.properties.$[property]);
        }

    }

});

module.exports = TagComponent;
},{"./component":4,"./utils":11}],11:[function(require,module,exports){
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
            // if (previous && previous.on) {
            //     previous.off()
            // }
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

var render_list = function(host, source_chain, renderer, renderer_data_property) {

    var handler = function(host, list) {
        var max = Math.max(host._children.length, list.length),
            children = host._children.concat();

        for (var i = 0; i < max; i++) {
            if (children[i] && list.toArray()[i]) {
                children[i][renderer_data_property] = list.toArray()[i];
            }
            else if (!children[i]) {
                var child = renderer.create();
                child[renderer_data_property] = list.toArray()[i];
                host.add(child);
            }
            else if (!list.toArray()[i]) {
                host.remove(children[i]);
            }
        }
    };
    
    var previous_list = null;
    var context = {};

    bind(host, source_chain, function() {
        resolve_property(host, source_chain, function(list) {
            if (previous_list) {
                previous_list.off('changed', null, context);
                previous_list = null;
            }
            if (list) {
                previous_list = list;
                list.on('changed', handler.bind(context, host, list), context);
                handler.bind(context, host, list)();
            }
        });
    });

    return handler;

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
    render_list: render_list
};

},{}],12:[function(require,module,exports){
(function (global){
var Protoplast = require('./js/protoplast'),
    App = require('./js/app'),
    ModelArray = require('./js/array'),
    CollectionView = require('./js/collection-view'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    Model = require('./js/model'),
    TagComponent = require('./js/tag-component'),
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
    Array: ModelArray,
    CollectionView: CollectionView,
    TagComponent: TagComponent,
    constructors: constructors,
    utils: utils
};

global.Protoplast = protoplast;
module.exports = protoplast;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./js/app":1,"./js/array":2,"./js/collection-view":3,"./js/component":4,"./js/constructors":5,"./js/di":6,"./js/dispatcher":7,"./js/model":8,"./js/protoplast":9,"./js/tag-component":10,"./js/utils":11}]},{},[12])(12)
});