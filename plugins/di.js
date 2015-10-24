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