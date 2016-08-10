(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.p = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Protoplast = require('./protoplast'),
    utils = require('./utils');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Protoplast.extend({

    $meta: {
        dom_processors: [utils.dom_processors.create_component, utils.dom_processors.inject_element],
        hooks: [{
            proto: function(proto) {
                if (proto.$meta.tag) {
                    console.log('registering' + proto.$meta.tag);
                    proto.__registry[proto.$meta.tag] = proto;
                }
            }
        }]
    },

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
        var i, elements, element, value, component;
        if (this._root) {

            (this.$meta.dom_processors || []).forEach(function(processor) {
                elements =  this._root.querySelectorAll('[' + processor.attribute + ']');
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    value = element.getAttribute(processor.attribute);
                    processor.process(this, element, value);
                }
            }, this);

            elements = this._root.getElementsByTagName('*');
            for (i = 0; i < elements.length; i++) {
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


},{"./protoplast":5,"./utils":6}],2:[function(require,module,exports){
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
},{"./utils":6}],3:[function(require,module,exports){

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


},{"./dispatcher":4,"./protoplast":5}],4:[function(require,module,exports){

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

},{"./protoplast":5}],5:[function(require,module,exports){
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
            Object.defineProperty(proto, property, desc);
        }
    }

    mixins_meta = (mixins || []).reduce(function(current, next) {
        return utils.merge(current, next.$meta);
    }, {});
    meta = utils.merge(meta, mixins_meta);
    proto.$meta = utils.merge(meta, this.$meta);

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

module.exports = Protoplast;



},{"./utils":6}],6:[function(require,module,exports){
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

var dom_processors = {
    inject_element: inject_element,
    create_component: create_component
};

module.exports = {
    createObject: createObject,
    merge: merge,
    mixin: mixin,
    uniqueId: uniqueId,
    dom_processors: dom_processors
};

},{}],7:[function(require,module,exports){
(function (global){
var Protoplast = require('./js/protoplast'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    utils = require('./js/utils'),
    constructors = require('./js/constructors');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    Dispatcher: Dispatcher,
    Context: Context,
    Component: Component,
    constructors: constructors,
    utils: utils
};

global.Protoplast = protoplast;
module.exports = protoplast;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./js/component":1,"./js/constructors":2,"./js/di":3,"./js/dispatcher":4,"./js/protoplast":5,"./js/utils":6}]},{},[7])(7)
});