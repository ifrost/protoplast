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
        merge_config_processor: function() {
            this.config.mixin = (this.config.mixin || []).concat(this.base_config.mixin || [])
        },
        pre_init_processor: function() {
            mixin(this.instance, this.config.mixin);
        }
    }

})(this);