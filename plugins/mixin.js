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