(function(exports) {
    "use strict";

    function protoplast_factory(plugins) {

        plugins = plugins || [];

        /**
         * Base protoplast
         * @type {Object}
         */
        var Proto = {},
            processors = {config: [], instance: [], constructor: [], proto: []};

        processors.default_config = plugins.map(function(plugin){return plugin.default_config_processor}).filter(Boolean);
        processors.merge_config = plugins.map(function(plugin){return plugin.merge_config_processor}).filter(Boolean);
        processors.pre_init = plugins.map(function(plugin){return plugin.pre_init_processor}).filter(Boolean);
        processors.post_init = plugins.map(function(plugin){return plugin.post_init_processor}).filter(Boolean);
        processors.constructor = plugins.map(function(plugin){return plugin.constructor_processor}).filter(Boolean);
        processors.proto = plugins.map(function(plugin){return plugin.proto_processor}).filter(Boolean);
        processors.protoplast = plugins.map(function(plugin){return plugin.protoplast_processor}).filter(Boolean);

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
        plugins: {}
    };

})(this);