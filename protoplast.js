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
            if (property !== 'init' && property.substr(0, 2) !== '__') {
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

    /**
     * Verifies whether prototype implements all methods in interfaces
     * @param proto
     * @param interfaces
     */
    function impl(proto, interfaces) {
        var exists, is_function, matches_params, error;
        interfaces.forEach(function(clazz){
            var i = clazz.__prototype__;
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

    function extend(mixins, factory) {

        if (mixins instanceof Function) {
            factory = mixins;
            mixins = [];
        }

        var proto = Object.create(this), constructor, meta = {};

        mixin(proto, mixins || []);
        if (factory) factory(proto, this, meta);

        proto.__meta__ = merge(meta, this.__meta__);
        proto.__base__ = this;

        impl(proto, proto.__meta__.impl);

        constructor = function () {
            var instance = Object.create(proto);
            instance.init.apply(instance, arguments);
            return instance;
        };

        constructor.__prototype__ = proto;
        constructor.__meta__ = proto.__meta__;
        constructor.extend = extend.bind(proto);
        constructor.impl = impl.bind(proto);

        return constructor;
    }

    var Protoplast = Object.create({});
    Protoplast.init = function(){};
    Protoplast.__meta__ = {impl: [], name: "Protoplast"};

    Protoplast.extend = extend;

    exports.Protoplast = Protoplast;

})(this);