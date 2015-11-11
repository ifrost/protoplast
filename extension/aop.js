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
    var Aop = Protoplast.extend(function(proto){

        /**
         * Applies aspects
         * @param {String[]} methods
         * @param {before: Function, after: Function} aspects
         */
        proto.aop = function(methods, aspects) {

            var to_wrap;

            if (arguments.length == 1) {
                to_wrap = this.superfactory;
                aspects = methods;
                methods = ['create'];
            }
            else {
                to_wrap = this.superfactory.prototype;
            }

            if (!(methods instanceof Array)) {
                methods = [methods];
            }

            methods.forEach(function(method){
                wrap(to_wrap, method, aspects);
            }, this);
        };

    }).initializer(function(superfactory){
        this.superfactory = superfactory;
    });

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Aop = Aop;

})(window);