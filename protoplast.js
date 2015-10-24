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