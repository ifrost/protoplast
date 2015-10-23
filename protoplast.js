(function(exports) {
    "use strict";

    var Proto = {};
    Proto.extend = function(factory) {
        var proto = Object.create(this), constructor;
        factory(proto, this);

        constructor = function() {
            var instance = Object.create(proto);
            instance.init.apply(instance, arguments);
            return instance;
        };
        constructor.extend = Proto.extend.bind(proto);
        return constructor;
    };
    Proto.init = function() {};

    exports.Proto = Proto;

})(this);