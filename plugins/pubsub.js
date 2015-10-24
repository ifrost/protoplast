(function(exports){
    "use strict";

    var Protoplast = exports.Protoplast;

    Protoplast.plugins.pubsub = {
        protoplast_processor: function(Proto) {
            Proto.register('pub', function (topic, message) {
                Proto.dispatcher.dispatch(topic, message);
            });

            Proto.register('sub', function (topic) {
                var self = this;
                return {
                    add: function (handler) {
                        Proto.dispatcher.on(topic, handler, self);
                    },
                    remove: function (handler) {
                        Proto.dispatcher.off(topic, handler, self);
                    }
                }
            });

            Proto.dispatcher = Proto.Dispatcher();
        }
    };

})(this);