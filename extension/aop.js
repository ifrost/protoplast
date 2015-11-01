(function(exports){

    var Protoplast = exports.Protoplast;

    function wrap(proto, method, aspects, origin) {
        origin = origin || proto[method];
        proto[method] = function () {
            if (aspects.before) aspects.before.apply(this, arguments);
            var result = origin.apply(this, arguments);
            if (aspects.after) result = aspects.after.apply(this, arguments);
            return result;
        }
    }

    var Aop = Protoplast.extend(function(proto){

        proto.init = function(aop_proto) {
            this.aop_proto = aop_proto instanceof Function ? aop_proto.__prototype__ : aop_proto;
        };

        proto.aop = function(methods, aspects) {
            var aop_proto = this.aop_proto;
            if (!(methods instanceof Array)) {
                methods = [methods];
            }
            methods.forEach(function(method){
                if (aop_proto[method] instanceof Function) {

                    // create a simple override delegating to the base class
                    // to make sure the base method is called if it was wrapped
                    // with an aspect
                    if (!aop_proto.hasOwnProperty(method)) {
                        aop_proto[method] = function () {
                            aop_proto.__base__[method].apply(this, arguments);
                        }
                    }

                    var origin = aop_proto[method];

                    wrap(aop_proto, method, aspects, origin);
                }
            });
        };

    });

    exports.Aop = Aop;

})(window);