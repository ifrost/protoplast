(function(exports) {
    "use strict";

    var _objects = {};
    function object_resolver(id) {
        return function() {
            return _objects[id];
        }
    }

    function inject(instance, config) {
        console.log(config);
        for (var property in config) {
            console.log(property);
            instance[property] = object_resolver(config[property])
        }
    }

    var Proto = {__protoplast_config: {}};
    Proto.extend = function(factory) {
        var proto = Object.create(this), constructor, base = this,
            config = Object.create(this.__protoplast_config) ;
        factory(proto, this, config);
        proto.__protoplast_config = config;

        constructor = function() {
            var instance = Object.create(proto);
            inject(instance, config);
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

    Proto.register = function(id, instance) {
        _objects[id] = instance;
    };

    exports.Proto = Proto;

})(this);