(function(exports) {
    "use strict";

    function createProtoplast() {

        /**
         * List of object in the context
         * @type {Object}
         * @private
         */
        var _objects = {};

        /**
         * Resolves dependency. If dependency is a function - delegates directly, otherwise tries to
         * retrieve the dependency
         * @param {String} id
         * @returns {Function}
         */
        function object_resolver(id) {
            return function () {
                return _objects[id] instanceof Function ? _objects[id].apply(this, arguments) : _objects[id];
            }
        }

        /**
         * Performs dependency injection based on the config
         * @param {Object} instance
         * @param {Object} config - {property:dependencyId,...}
         */
        function inject(instance, config) {
            for (var property in config) {
                instance[property] = object_resolver(config[property]).bind(instance)
            }
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

        /**
         * Mixes source properites into destination object
         * @param {Object} destination
         * @param {Object} source
         * @returns {Object}
         */
        function mix(destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        }

        /**
         * Base protoplast
         * @type {Object}
         */
        var Proto = {__config: {inject: {}, mixin: []}};

        /**
         * Creates a new prototype that extends current prototype
         * @param {Function} factory - factory to create prototype factory(proto, $super, config)
         * @returns {Function} constructor - function used to create instances based on the prototype
         */
        Proto.extend = function (factory) {
            var proto = Object.create(this), constructor, base = this,
                config = {inject: {}, mixin: []};

            factory(proto, this, config);

            // merge configs
            proto.__config = {
                inject: mix(config.inject, this.__config.inject),
                mixin: config.mixin.concat(this.__config.mixin)
            };

            constructor = function () {
                var instance = Object.create(proto);
                inject(instance, proto.__config.inject);
                mixin(instance, proto.__config.mixin);
                instance.init.apply(instance, arguments);
                return instance;
            };

            constructor.extend = Proto.extend.bind(proto);

            constructor.aop = function (method, aspects) {
                if (proto[method] instanceof Function) {

                    // create a simple override delegating to the base class
                    // to make sure the base method is called if it was wrapped
                    // with an aspect
                    if (!proto.hasOwnProperty(method)) {
                        proto[method] = function () {
                            base[method].apply(this, arguments);
                        }
                    }

                    var origin = proto[method];

                    proto[method] = function () {
                        if (aspects.before) aspects.before.apply(this, arguments);
                        var result = origin.apply(this, arguments);
                        if (aspects.after) result = aspects.after.apply(this, arguments);
                        return result;
                    }
                }
            };

            return constructor;
        };
        Proto.init = function () {};

        /**
         * Registers object in the DI context
         * @param {String} id
         * @param {Object} instance
         */
        Proto.register = function (id, instance) {
            _objects[id] = instance;
        };


        Proto.register('pub', function (topic, message) {
            Proto.dispatcher.dispatch(topic, message);
        });

        Proto.register('sub', function (topic) {
            var self = this;
            return {
                add: function (handler) {
                    Proto.dispatcher.on(topic, handler, self);
                },
                remove: function (handler) {
                    Proto.dispatcher.off(topic, handler, self);
                }
            }
        });

        /**
         * EventDispatcher implementation, can be used as mixin or base protoype
         * @type {Function}
         */
        Proto.Dispatcher = Proto.extend(function (proto) {

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

        Proto.dispatcher = Proto.Dispatcher();

        return Proto;
    }

    exports.Protoplast = createProtoplast;

})(this);