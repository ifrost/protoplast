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
        if (!proto[method]) {
            throw Error("Can't create aspect for method " + method + ". Method does not exist.")
        }
        proto[method] = function () {
            if (aspects.before) aspects.before.apply(this, arguments);
            var result = origin.apply(this, arguments);
            if (aspects.after) result = aspects.after.call(this, result, arguments);
            return result;
        }
    }

    /**
     * AOP Manager. Allows to add aspects to a prototype
     */
    var Aop = Protoplast.extend(function(constructor){
        this.constructor = constructor;
    }).define({

        /**
         * Applies aspects
         * @param {String[]} methods
         * @param {before: Function, after: Function} aspects
         */
        aop: function(methods, aspects) {

            if (!(methods instanceof Array)) {
                methods = [methods];
            }

            methods.forEach(function(method){
                wrap(this.constructor.prototype, method, aspects);
            }, this);
        }

    });

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Aop = Aop;

})(window);