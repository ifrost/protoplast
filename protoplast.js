(function(exports) {
    "use strict";

    /**
     * Merges processors of the same type from multiple plugins
     * @param {Object} plugins
     * @param {String} processor_name
     * @returns {Function[]}
     */
    function concat_processors(plugins, processor_name) {
        return plugins.map(function(plugin){return plugin[processor_name]}).filter(Boolean);
    }

    function protoplast_factory(config) {

        /**
         * Base protoplast
         * @type {Object}
         */
        var Proto = {};

        config = config || {};
        config.plugins = config.plugins || [];
        Proto.__config = config;
        Proto.init = function () {};

        /**
         * Extend current prototype
         * @param {Function} factory - factory to create prototype factory(proto, base, config)
         * @returns {Function} constructor - function used to create instances based on the prototype
         */
        Proto.extend = function (factory) {
            var proto = Object.create(this), constructor, base = this,
                config = {}, factory_result;

            factory = factory || function(){};

            factory_result = factory(proto, this, config);

            constructor = function () {
                context.instance = Object.create(proto);
                context.args = Array.prototype.slice.call(arguments);

                processors.pre_init.forEach(function(processor){processor.call(context)});
                context.instance.init.apply(context.instance, context.args);
                processors.post_init.forEach(function(processor){processor.call(context)});

                return context.instance;
            };

            config.plugins = (this.__config.plugins || []).concat(config.plugins || []);
            var context = {
                    proto: proto,
                    factory: factory,
                    base: base,
                    config: config,
                    base_config: this.__config,
                    factory_result: factory_result,
                    Proto: Proto,
                    constructor: constructor
                },
                processors = {
                    merge_config: concat_processors(config.plugins, 'merge_config_processor'),
                    pre_init: concat_processors(config.plugins, 'pre_init_processor'),
                    post_init: concat_processors(config.plugins, 'post_init_processor'),
                    constructor: concat_processors(config.plugins, 'constructor_processor'),
                    proto: concat_processors(config.plugins, 'proto_processor'),
                    protoplast: concat_processors(config.plugins, 'protoplast_processor')
                };

            processors.merge_config.forEach(function(processor){processor.call(context);});
            proto.__config = config;

            processors.proto.forEach(function(processor){processor.call(context)});

            constructor.extend = Proto.extend.bind(proto);
            constructor.__proto = proto;
            processors.constructor.forEach(function(processor){processor.call(context)});
            return constructor;
        };
        concat_processors(config.plugins, 'protoplast_processor').forEach(function(processor){processor.call(null, Proto)});
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