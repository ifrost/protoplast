(function(exports){

    var Protoplast = exports.Protoplast;

    /**
     * Wraps the method with aspects
     * @param {Object} proto
     * @param {String} method
     * @param {before: Function, after:Function} aspects
     */
    function wrap(proto, method, aspects) {
        var origin = proto[method];
        proto[method] = function () {
            if (aspects.before) aspects.before.apply(this, arguments);
            var result = origin.apply(this, arguments);
            if (aspects.after) result = aspects.after.apply(this, arguments);
            return result;
        }
    }

    /**
     * AOP Manager. Allows to add aspects to a prototype
     */
    var Aop = Protoplast.extend(function(proto){

        proto.init = function(constructor) {
            this.aop_proto = constructor.__prototype__;
        };

        /**
         * Applies aspects
         * @param {String[]} methods
         * @param {before: Function, after: Function} aspects
         */
        proto.aop = function(methods, aspects) {

            if (!(methods instanceof Array)) {
                methods = [methods];
            }

            methods.forEach(function(method){
                wrap(this.aop_proto, method, aspects);
            }, this);
        };

    });

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Aop = Aop;

})(window);