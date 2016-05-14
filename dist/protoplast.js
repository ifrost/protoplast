(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.p = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Wraps the method with aspects
 * @param {Object} proto
 * @param {String} method
 * @param {{before: Function, after:Function}} aspects
 */
function wrap(proto, method, aspects) {
    var origin = proto[method];
    if (!proto[method]) {
        throw Error("Can't create aspect for method " + method + ". Method does not exist.")
    }
    proto[method] = function() {
        if (aspects.before) aspects.before.apply(this, arguments);
        var result = origin.apply(this, arguments);
        if (aspects.after) result = aspects.after.call(this, result, arguments);
        return result;
    }
}

/**
 * AOP Manager. Allows to add aspects to a prototype
 */
var Aop = function(proto) {
    return {
        /**
         * Applies aspects
         * @param {String[]|String} methods
         * @param {{before: Function, after: Function}} aspects
         */
        aop: function(methods, aspects) {

            if (!(methods instanceof Array)) {
                methods = [methods];
            }

            methods.forEach(function(method) {
                wrap(proto, method, aspects);
            }, this);
            return this;
        }

    }
};

module.exports = Aop;


},{}],2:[function(require,module,exports){
var Protoplast = require('./protoplast');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Protoplast.extend({

    $create: function() {
        this._children = [];
        this.root = document.createElement(this.tag || 'div');
    },

    __fastinject__: {
        get: function() {return this.___fastinject___},
        set: function(value) {
            this.___fastinject___ = value;
            // fastinject all the children
            this._children.forEach(function(child) {
                this.__fastinject__(child);
                child.__fastinject__ = this.__fastinject__;
            }, this);
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


},{"./protoplast":6}],3:[function(require,module,exports){
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
},{"./utils":7}],4:[function(require,module,exports){

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

        if (instance.$meta && instance.$meta.inject) {
            this.inject(instance, instance.$meta.inject);
        }

    },

    process: function(obj) {
        if (obj.$meta && obj.$meta.inject_init) {
            Object.keys(obj.$meta.inject_init).forEach(function(handler){
                obj[handler]();
            }, this);
        }
        if (obj.$meta && obj.$meta.sub) {
            Object.keys(obj.$meta.sub).forEach(function(handler){
                this._objects.sub.call(obj, obj.$meta.sub[handler]).add(obj[handler]);
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


},{"./dispatcher":5,"./protoplast":6}],5:[function(require,module,exports){

var Protoplast = require('./protoplast');

/**
 * EventDispatcher implementation, can be used as mixin or base protoype
 * @type {Function}
 */
var Dispatcher = Protoplast.extend({

    dispatch: function(topic, message) {
        this._topics = this._topics || {};
        (this._topics[topic] || []).forEach(function(config) {
            config.handler.call(config.context, message);
        })
    },

    on: function(topic, handler, context) {
        if (!handler) {
            throw new Error('Handler is required for event ' + topic);
        }
        this._topics = this._topics || {};
        this._topics[topic] = this._topics[topic] || [];
        this._topics[topic].push({handler: handler, context: context});
    },

    off: function(topic, handler, context) {
        this._topics = this._topics || {};
        this._topics[topic] = this._topics[topic].filter(function(config) {
            return handler ? config.handler !== handler : config.context !== context
        })
    }
});

module.exports = Dispatcher;

},{"./protoplast":6}],6:[function(require,module,exports){
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
 * @param definition
 * @returns {Object}
 */
Protoplast.extend = function(mixins, definition) {
    var proto = Object.create(this), meta, desc, defined;

    // set defaults
    if (!(mixins instanceof Array)) {
        definition = mixins;
        mixins = [];
    }
    definition = definition || {};
    mixins = mixins || [];
    meta = definition.$meta || {};
    delete definition.$meta;

    if (definition.$create !== undefined) {
        meta.$constructors = meta.$constructors || [];
        meta.$constructors.push(definition.$create);
        delete definition.$create;
    }

    proto = utils.mixin(proto, mixins);

    for (var property in definition) {
        defined = false;

        if (Object.prototype.toString.call(definition[property]) !== "[object Object]") {
            defined = true;
            desc = {value: definition[property], writable: true, enumerable: true};
        } else {
            desc = definition[property];
            for (var d in desc) {
                if (['value', 'get', 'set', 'writable', 'enumerable'].indexOf(d) === -1) {
                    meta[d] = meta[d] || {};
                    meta[d][property] = desc[d];
                    delete desc[d];
                }
                else {
                    defined = true;
                }
            }
        }
        if (defined) {
            Object.defineProperty(proto, property, desc);
        }
    }

    proto.$meta = utils.merge(meta, this.$meta);
    proto.$super = this;

    utils.processPrototype(proto);

    return proto;
};

module.exports = Protoplast;



},{"./utils":7}],7:[function(require,module,exports){
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
    if (instance.$meta.$constructors) {
        instance.$meta.$constructors.forEach(function(constructor){
            constructor.apply(instance, args);
        });
    }
    return instance;
}

/**
 * Run all processors from metadata on a prototype
 * @param {Object} proto
 */
function processPrototype(proto) {
    if (proto.$meta.$processors) {
        proto.$meta.$processors.forEach(function(processor) {
            processor(proto);
        });
    }
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
            else if (['number', 'boolean', 'string'].indexOf(typeof(source[property])) !== -1) {
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
    processPrototype: processPrototype,
    merge: merge,
    mixin: mixin,
    uniqueId: uniqueId
};

},{}],8:[function(require,module,exports){
var Protoplast = require('./js/protoplast'),
    Aop = require('./js/aop'),
    Dispatcher = require('./js/dispatcher'),
    Context = require('./js/di'),
    Component = require('./js/component'),
    utils = require('./js/utils'),
    constructors = require('./js/constructors');

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    Dispatcher: Dispatcher,
    Aop: Aop,
    Context: Context,
    Component: Component,
    constructors: constructors,
    utils: utils
};

module.exports = protoplast;
},{"./js/aop":1,"./js/component":2,"./js/constructors":3,"./js/di":4,"./js/dispatcher":5,"./js/protoplast":6,"./js/utils":7}]},{},[8])(8)
});