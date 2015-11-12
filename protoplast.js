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
            mix(instance, Mixin.prototype);
        });
        return instance;
    }

    /**
     * Base protoplast constructor
     * @constructor
     */
    var Protoplast = function() {
    };

    /**
     * Creates new factory function
     * @param [mixins]
     * @param definition
     * @returns {Function}
     */
    Protoplast.extend = function(mixins, definition) {
        var base = this, constructor;

        // set defaults
        if (!(mixins instanceof Array)) {
            definition = mixins;
            mixins = [];
        }
        definition = definition || {};
        mixins = mixins || [];
        definition.__meta__ = definition.__meta__ || {};
        constructor = definition.__init__ || function() {
            base.apply(this, arguments);
        };

        // create prototype
        constructor.prototype = Object.create(base.prototype);
        constructor.base = base.prototype;

        // mixin
        mixin(constructor.prototype, mixins);

        // create prototype properties
        for (var property in definition) {
            if (property !== '__meta__' && property !== '__init') {
                constructor.prototype[property] = definition[property];
            }
        }

        // assign metadata
        constructor.prototype.__meta__ = merge(definition.__meta__, constructor.base.__meta__);
        constructor.__meta__ = constructor.prototype.__meta__;

        // assign extend function
        constructor.extend = Protoplast.extend.bind(constructor);

        return constructor;
    };
    Protoplast.prototype.__meta__ = {};

    exports.Protoplast = Protoplast;

})(this);