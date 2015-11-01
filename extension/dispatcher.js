(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

    /**
     * EventDispatcher implementation, can be used as mixin or base protoype
     * @type {Function}
     */
    var Dispatcher = Protoplast.extend(function (proto) {

        proto.dispatch = function (topic, message) {
            this._topics = this._topics || {};
            (this._topics[topic] || []).forEach(function (config) {
                config.handler.call(config.context, message);
            })
        };

        proto.on = function (topic, handler, context) {
            this._topics = this._topics || {};
            this._topics[topic] = this._topics[topic] || [];
            this._topics[topic].push({handler: handler, context: context});
        };

        proto.off = function (topic, handler, context) {
            this._topics = this._topics || {};
            this._topics[topic] = this._topics[topic].filter(function (config) {
                return handler ? config.handler !== handler : config.context !== context
            })
        };
    });

    exports.Dispatcher = Dispatcher;

})(this);