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
            mix(instance, Mixin);
        });
        return instance;
    }

    /**
     * Instance factory for create method
     */
    function factory(base, fn) {
        return function() {
            var instance = base.create.apply(this, arguments);
            fn.apply(instance, arguments);
            return instance;
        };
    }

    /**
     * Base protoplast
     */
    var Protoplast = {
        $meta: {},
        create: function() {
            return Object.create(this);
        }
    };

    /**
     * Creates new factory function
     * @param [mixins]
     * @param definition
     * @returns {Object}
     */
    Protoplast.extend = function(mixins, definition) {
        var proto = Object.create(this), meta, desc, defined;

        // set defaults
        if (!(mixins instanceof Array)) {
            definition = mixins;
            mixins = [];
        }
        definition = definition || {};
        mixins = mixins || [];
        meta = definition.$meta || {};
        delete definition.$meta;

        if (definition.$create !== undefined) {
            proto.create = factory(this, definition.$create);
            delete definition.$create;
        }
        proto = mixin(proto, mixins);

        for (var property in definition) {
            defined = false;
                    
            if (Object.prototype.toString.call(definition[property]) !== "[object Object]") {
                defined = true;
                desc = {value: definition[property], writable: true, enumerable: true};
            } else {
                desc = definition[property];
                for (var d in desc) {
                    if (['value', 'get', 'set', 'writable', 'enumerable'].indexOf(d) === -1) {
                        meta[d] = meta[d] || {};
			meta[d][property] = desc[d];
                        delete desc[d];
		    }
		    else {
			defined = true;
		    }
                } 
            }
            if (defined) {
                Object.defineProperty(proto, property, desc);
            }
        }

        proto.$meta = merge(meta, this.$meta);

        return proto;
    };

    exports.Protoplast = Protoplast;

})(this);
