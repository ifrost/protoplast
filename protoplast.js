(function(exports) {
    "use strict";

    var Proto = {};
    Proto.extend = function(factory) {
        var proto = Object.create(this), constructor, base = this;
        factory(proto, this);

        constructor = function() {
            var instance = Object.create(proto);
            instance.init.apply(instance, arguments);
            return instance;
        };

        constructor.extend = Proto.extend.bind(proto);

        constructor.aop = function(method, aspects) {
            if (proto[method] instanceof Function) {

                // create a simple override delegating to the base class
                // to make sure the base method is called if it was wrapped
                // with an aspect
                if (!proto.hasOwnProperty(method)){
                    proto[method] = function() {
                        base[method].apply(this, arguments);
                    }
                }

                var origin = proto[method];

                proto[method] = function() {
                    if (aspects.before) aspects.before.apply(this, arguments);
                    var result = origin.apply(this, arguments);
                    if (aspects.after) result = aspects.after.apply(this, arguments);
                    return result;
                }
            }
        };

        return constructor;
    };
    Proto.init = function() {};

    exports.Proto = Proto;

})(this);