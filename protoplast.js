(function(exports) {
    "use strict";

    function merge(destination, source) {
        for (var property in source) {
            if (source[property] instanceof Array) {
                destination[property] = destination[property] || [];
                destination[property] = source[property].concat(destination[property]);
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
     * Mixes source properties into destination object
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

    function extend(mixins, factory) {

        if (mixins instanceof Function) {
            factory = mixins;
            mixins = [];
        }

        var proto = Object.create(this), constructor, meta = {};
        if (factory) factory(proto, this, meta);

        proto.__meta__ = merge(meta, this.__meta__);
        proto.__base__ = this;
        mixin(proto, mixins || []);

        constructor = function () {
            var instance = Object.create(proto);
            instance.init.apply(instance, arguments);
            return instance;
        };

        constructor.__prototype__ = proto;
        constructor.__meta__ = proto.__meta__;
        constructor.extend = extend.bind(proto);

        return constructor;
    }

    var Protoplast = Object.create({});
    Protoplast.init = function(){};
    Protoplast.__meta__ = {};

    Protoplast.extend = extend;

    exports.Protoplast = Protoplast;

})(this);