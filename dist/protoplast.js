(function(exports) {
    "use strict";

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
     * Mixes mixin source properties into destination object
     * @param {Object} destination
     * @param {Object} source
     * @returns {Object}
     */
    function mix(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property) && property.substr(0, 2) !== '__') {
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
     * Instance factory for create method
     */
    function factory(base, fn) {
        return function() {
            var instance = base.create.apply(this, arguments);
            fn.apply(instance, arguments);
            return instance;
        };
    }

    /**
     * Base protoplast
     */
    var Protoplast = {
        $meta: {},
        create: function() {
            return Object.create(this);
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
            proto.create = factory(this, definition.$create);
            delete definition.$create;
        }
        proto = mixin(proto, mixins);

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

        proto.$meta = merge(meta, this.$meta);

        return proto;
    };

    exports.Protoplast = Protoplast;

})(this);

(function(exports) {

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

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Aop = Aop;

})(window);

(function(exports) {
    "use strict";

    var Protoplast = exports.Protoplast;

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

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Dispatcher = Dispatcher;

})(this);
(function(exports) {

    var Dispatcher = exports.ProtoplastExt.Dispatcher;

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
            }
            else {
                this._objects[id] = instance;
            }

            instance.__fastinject__ = function(obj) {
                this.register(obj);
                if (obj.$meta && obj.$meta.inject_init) {
                    obj[Object.keys(obj.$meta.inject_init)[0]]();
                }
            }.bind(this);

            this.inject(instance, instance.$meta.inject);
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
                if (instance.$meta && instance.$meta.inject_init) {
                    instance[Object.keys(instance.$meta.inject_init)[0]]();
                }
            }.bind(this));
        }

    });

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Context = Context;

})(window);

(function(exports) {

    var Protoplast = exports.Protoplast;

    /**
     * Creates a simple component tree-like architecture for the view layer. Used with DI
     * @alias Component
     */
    var Component = Protoplast.extend({

        $create: function() {
            this._children = [];
            this.root = document.createElement(this.tag || 'div');
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
            this._children.forEach(function(child) {
                this.remove(child);
            }, this);
        },

        /**
         * Injected handler
         */
        injected: function() {
            this.init();
        },

        /**
         * Add a child component
         * @param {Component} child
         */
        add: function(child) {
            this._children.push(child);
            this.__fastinject__(child);
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

    Component.Root = function(element, context) {
        var component = Component.create();
        component.root = element;
        context.register(component);
        return component;
    };

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Component = Component;

})(window);
