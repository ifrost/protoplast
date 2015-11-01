(function(exports) {
    "use strict";

    function merge(destination, source) {
        for (var property in source) {
            if (source[property] instanceof Array) {
                destination[property] = destination[property] || [];
                destination[property] = source[property].concat(destination[property]);
            }
            else if (['number','boolean','string'].indexOf(typeof(source[property])) !== -1) {
                if (!destination.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
            else {
                destination[property] = destination[property] || {};
                merge(destination[property], source[property]);
            }
        }
        return destination;
    }

    /**
     * Mixes source properties into destination object
     * @param {Object} destination
     * @param {Object} source
     * @returns {Object}
     */
    function mix(destination, source) {
        for (var property in source) {
            if (property !== 'init' && property.substr(0, 2) !== '__') {
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
        mixins.forEach(function (Mixin) {
            mix(instance, Mixin());
        });
        return instance;
    }

    function extend(mixins, factory) {

        if (mixins instanceof Function) {
            factory = mixins;
            mixins = [];
        }

        var proto = Object.create(this), constructor, meta = {};
        if (factory) factory(proto, this, meta);

        proto.__meta__ = merge(meta, this.__meta__);
        proto.__base__ = this;
        mixin(proto, mixins || []);

        constructor = function () {
            var instance = Object.create(proto);
            instance.init.apply(instance, arguments);
            return instance;
        };

        constructor.__prototype__ = proto;
        constructor.__meta__ = proto.__meta__;
        constructor.extend = extend.bind(proto);

        return constructor;
    }

    var Protoplast = Object.create({});
    Protoplast.init = function(){};
    Protoplast.__meta__ = {};

    Protoplast.extend = extend;

    exports.Protoplast = Protoplast;

})(this);
(function(exports){

    var Protoplast = exports.Protoplast;

    function wrap(proto, method, aspects, origin) {
        origin = origin || proto[method];
        proto[method] = function () {
            if (aspects.before) aspects.before.apply(this, arguments);
            var result = origin.apply(this, arguments);
            if (aspects.after) result = aspects.after.apply(this, arguments);
            return result;
        }
    }

    var Aop = Protoplast.extend(function(proto){

        proto.init = function(aop_proto) {
            this.aop_proto = aop_proto instanceof Function ? aop_proto.__prototype__ : aop_proto;
        };

        proto.aop = function(methods, aspects) {
            var aop_proto = this.aop_proto;
            if (!(methods instanceof Array)) {
                methods = [methods];
            }
            methods.forEach(function(method){
                if (aop_proto[method] instanceof Function) {

                    // create a simple override delegating to the base class
                    // to make sure the base method is called if it was wrapped
                    // with an aspect
                    if (!aop_proto.hasOwnProperty(method)) {
                        aop_proto[method] = function () {
                            aop_proto.__base__[method].apply(this, arguments);
                        }
                    }

                    var origin = aop_proto[method];

                    wrap(aop_proto, method, aspects, origin);
                }
            });
        };

    });

    exports.Aop = Aop;

})(window);
(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

    /**
     * EventDispatcher implementation, can be used as mixin or base protoype
     * @type {Function}
     */
    var Dispatcher = Protoplast.extend(function (proto) {

        proto.dispatch = function (topic, message) {
            this._topics = this._topics || {};
            (this._topics[topic] || []).forEach(function (config) {
                config.handler.call(config.context, message);
            })
        };

        proto.on = function (topic, handler, context) {
            this._topics = this._topics || {};
            this._topics[topic] = this._topics[topic] || [];
            this._topics[topic].push({handler: handler, context: context});
        };

        proto.off = function (topic, handler, context) {
            this._topics = this._topics || {};
            this._topics[topic] = this._topics[topic].filter(function (config) {
                return handler ? config.handler !== handler : config.context !== context
            })
        };
    });

    exports.Dispatcher = Dispatcher;

})(this);
(function(exports){

    var Dispatcher = exports.Dispatcher;

    var Context = Protoplast.extend(function(proto){

        /**
         * Map of object in the context
         * @type {Object}
         * @private
         */
        proto._objects = null;

        proto.init = function() {
            var self = this;
            this._objects = {
                pub: function (topic, message) {
                    self._dispatcher.dispatch(topic, message);
                },
                sub: function (topic) {
                    var instance_self = this;
                    return {
                        add: function (handler) {
                            self._dispatcher.on(topic, handler, instance_self);
                        },
                        remove: function (handler) {
                            self._dispatcher.off(topic, handler, instance_self);
                        }
                    }
                }
            };
            this._dispatcher = Dispatcher();
        };

        /**
         * Registers object in the DI context
         * @param {String} id
         * @param {Object} instance
         */
        proto.register = function (id, instance) {
            if (arguments.length == 1) {
                instance = id;
            }
            else {
                this._objects[id] = instance;
            }

            instance.__fastinject__ = function(obj) {
                this.register(obj);
                if (obj.injected instanceof Function) {
                    obj.injected();
                }
            }.bind(this);

            this.inject(instance, instance.__meta__.inject);
        };

        /**
         * Performs dependency injection based on the config
         * @param {Object} instance
         * @param {Object} config - {property:dependencyId,...}
         */
        proto.inject = function(instance, config) {
            var self = this, id;
            for (var property in config) {
                id = config[property];

                (function(id){
                    Object.defineProperty(instance, property, {
                        get: function() {
                            return self._objects[id];
                        }
                    });
                })(id);
            }
        };

        proto.build = function() {
            Object.keys(this._objects).forEach(function(id) {
                var instance = this._objects[id];
                if (instance.injected instanceof Function) {
                    instance.injected();
                }
            }.bind(this));
        };

    });

    exports.Context = Context;

})(window);
(function(exports){

    var Protoplast = exports.Protoplast;

    var Component = Protoplast.extend(function(proto, base, meta){

        proto.init = function() {
            this._children = [];
            this.root = document.createElement(this.__meta__.tag);
        };

        proto.create = function() {

        };

        proto.injected = function() {
            this.create();
        };

        proto.add = function(child) {
            this._children.push(child);
            if (this.__fastinject__) {
                this.__fastinject__(child);
            }
            this.root.appendChild(child.root);
        };

    });

    exports.Component = Component;

})(window);