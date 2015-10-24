(function(exports) {
    "use strict";

    function protoplast_factory(plugins) {

        plugins = plugins || [];

        /**
         * Base protoplast
         * @type {Object}
         */
        var Proto = {},
            processors = {};

        function concat_processors(plugins, processor_name) {
            return plugins.map(function(plugin){return plugin[processor_name]}).filter(Boolean);
        }

        processors.default_config = concat_processors(plugins, 'default_config_processor');
        processors.merge_config = concat_processors(plugins, 'merge_config_processor');
        processors.pre_init = concat_processors(plugins, 'pre_init_processor');
        processors.post_init = concat_processors(plugins, 'post_init_processor');
        processors.constructor = concat_processors(plugins, 'constructor_processor');
        processors.proto = concat_processors(plugins, 'proto_processor');
        processors.protoplast = concat_processors(plugins, 'protoplast_processor');

        Proto.__config = {};
        Proto.init = function () {};
        processors.default_config.forEach(function(processor){processor.call(null, Proto.__config)});

        /**
         * Creates a new prototype that extends current prototype
         * @param {Function} factory - factory to create prototype factory(proto, $super, config)
         * @returns {Function} constructor - function used to create instances based on the prototype
         */
        Proto.extend = function (factory) {
            var proto = Object.create(this), constructor, base = this,
                config = {}, factory_result;

            factory = factory || function(){};

            processors.default_config.forEach(function(processor){processor.call(null, config)});
            factory_result = factory(proto, this, config);

            processors.proto.forEach(function(processor){processor.call(null, proto, factory_result, base, Proto)});

            processors.merge_config.forEach(function(processor){processor.call(null, config, proto.__config);});
            proto.__config = config;

            constructor = function () {
                var instance = Object.create(proto),
                    args = Array.prototype.slice.call(arguments);
                processors.pre_init.forEach(function(processor){processor.call(null, instance, args, proto, base, Proto)});
                instance.init.apply(instance, args);
                processors.post_init.forEach(function(processor){processor.call(null, instance, args, proto, base, Proto)});
                return instance;
            };

            constructor.extend = Proto.extend.bind(proto);
            constructor.__proto = proto;
            processors.constructor.forEach(function(processor){processor.call(null, constructor, proto, base, Proto)});
            return constructor;
        };
        processors.protoplast.forEach(function(processor){processor.call(null, Proto)});
        return Proto;
    }

    exports.Protoplast = {
        create: protoplast_factory,
        plugins: {},
        get_all_plugins: function() {
            var plugins = [];
            for (var plugin_name in this.plugins) {
                plugins.push(this.plugins[plugin_name]);
            }
            return plugins;
        }
    };

})(this);
(function(exports) {
    "use strict";

    var Protoplast = exports.Protoplast;

    Protoplast.plugins.aop = {
        constructor_processor: function (constructor, proto, base) {
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
                        var block = false;
                        if (aspects.before) block = aspects.before.apply(this, arguments);
                        if (!block) {
                            var result = origin.apply(this, arguments);
                            if (aspects.after) result = aspects.after.apply(this, arguments);
                            return result;
                        }
                        else {
                            return block.result;
                        }
                    }
                }
            };
        }
    }

})(this);
(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

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
     * Mixes source properties into destination object
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
     * Performs dependency injection based on the config
     * @param {Object} instance
     * @param {Object} config - {property:dependencyId,...}
     */
    function inject(instance, config) {
        for (var property in config) {
            instance[property] = object_resolver(config[property]).bind(instance)
        }
    }

    Protoplast.plugins.di = {
        default_config_processor: function(config) {
            config.inject = {};
        },
        merge_config_processor: function(target, base) {
            target.inject = mix(target.inject, base.inject)
        },
        pre_init_processor: function(instance, args, proto) {
            inject(instance, proto.__config.inject);
        },
        protoplast_processor: function(Proto) {
            /**
             * Registers object in the DI context
             * @param {String} id
             * @param {Object} instance
             */
            Proto.register = function (id, instance) {
                _objects[id] = instance;
            };
        }
    }

})(this);
(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

    Protoplast.plugins.dispatcher =  {
        protoplast_processor: function(Proto) {
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
        }
    };


})(this);
(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

    /**
     * Mixes source properties into destination object
     * @param {Object} destination
     * @param {Object} source
     * @returns {Object}
     */
    function mix(destination, source) {
        for (var property in source) {
            if (property !== 'init') {
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

    Protoplast.plugins.mixin = {
        default_config_processor: function(config) {
            config.mixin = [];
        },
        merge_config_processor: function(target, base) {
            target.mixin = target.mixin.concat(base.mixin)
        },
        pre_init_processor: function(instance, args, proto) {
            mixin(instance, proto.__config.mixin);
        }
    }

})(this);
(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

    Protoplast.plugins.pubsub = {
        protoplast_processor: function(Proto) {
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

            Proto.dispatcher = Proto.Dispatcher();
        }
    };

})(this);