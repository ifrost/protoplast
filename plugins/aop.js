(function(exports) {
    "use strict";

    var Protoplast = exports.Protoplast;

    Protoplast.plugins.aop = {
        constructor_processor: function (constructor, proto, base) {
            constructor.aop = function (method, aspects) {
                if (proto[method] instanceof Function) {

                    // create a simple override delegating to the base class
                    // to make sure the base method is called if it was wrapped
                    // with an aspect
                    if (!proto.hasOwnProperty(method)) {
                        proto[method] = function () {
                            base[method].apply(this, arguments);
                        }
                    }

                    var origin = proto[method];

                    proto[method] = function () {
                        if (aspects.before) aspects.before.apply(this, arguments);
                        var result = origin.apply(this, arguments);
                        if (aspects.after) result = aspects.after.apply(this, arguments);
                        return result;
                    }
                }
            };
        }
    }

})(this);