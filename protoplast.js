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
            if (source[property] instanceof Array) {
                destination[property] = source[property].concat(destination[property] || []);
            }
            else if (['number','boolean','string'].indexOf(typeof(source[property])) !== -1) {
                if (!destination.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
            else {
                destination[property] = destination[property] || {};
                merge(destination[property], source[property]);
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
            if (property.substr(0, 2) !== '__') {
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
            mix(instance, Mixin.prototype);
        });
        return instance;
    }

    /**
     * Verifies whether prototype implements all methods in interfaces
     * @param proto
     * @param interfaces
     */
    function impl(proto, interfaces) {
        var exists, is_function, matches_params, error;
        interfaces.forEach(function(superfactory){
            var i = superfactory.prototype;
            for (var property in i) {
                if (i.hasOwnProperty(property) && typeof i[property] === "function") {
                    exists = proto[property];
                    is_function = typeof proto[property] === "function";
                    matches_params = is_function && proto[property].length === i[property].length;
                    if (!exists || !is_function || !matches_params) {
                        error = 'Prototype ' + proto.__meta__.name + ' should implement method ' + property + ' with ' + i[property].length + ' param(s), ';
                        if (!exists) error += property + ' not found in the prototype';
                        if (exists && !is_function) error += property + ' is not a function';
                        if (exists && is_function && !matches_params) error += proto[property].length + ' param(s) found';
                        throw new Error(error);
                    }
                }
            }
        });
    }

    var Protoplast = function() {};

    Protoplast.extend = function(mixins, constructor) {
        var base = this;

        if (mixins instanceof Function) {
            constructor = mixins;
            mixins = [];
        }
        constructor = constructor || function() {
            base.apply(this, arguments);
        };
        mixins = mixins || [];

        constructor.prototype = Object.create(base.prototype);
        constructor.base = base.prototype;

        mixin(constructor.prototype, mixins);

        constructor.extend = Protoplast.extend.bind(constructor);

        constructor.define = function(properties) {
            for (var property in properties) {
                constructor.prototype[property] = properties[property];
            }
            return constructor;
        };

        constructor.meta = function(meta) {
            constructor.prototype.__meta__ = merge(meta, base.prototype.__meta__);
            constructor.__meta__ = constructor.prototype.__meta__;
            return constructor;
        };

        constructor.impl = function(interfaces) {
            impl(constructor.prototype, interfaces);
            return constructor;
        };

        constructor.meta({});

        return constructor;
    };
    Protoplast.prototype.__meta__ = {};

    exports.Protoplast = Protoplast;

})(this);