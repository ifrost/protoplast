
var Protoplast = require('./protoplast');

/**
 * EventDispatcher implementation, can be used as mixin or base protoype
 */
var Dispatcher = Protoplast.extend({

    $create: function() {
        this._topics = {};
    },

    dispatch: function(topic) {
        var args = Array.prototype.slice.call(arguments, 1);
        (this._topics[topic] || []).forEach(function(config) {
            config.handler.apply(config.context, args);
        })
    },

    on: function(topic, handler, context) {
        if (!handler) {
            throw new Error('Handler is required for event ' + topic);
        }
        this._topics[topic] = this._topics[topic] || [];
        this._topics[topic].push({handler: handler, context: context});
    },

    off: function(topic, handler, context) {
        if (!topic) {
            for (topic in this._topics) {
                if (this._topics.hasOwnProperty(topic)) {
                    this.off(topic, handler, context);
                }
            }
        }
        else {
            this._topics[topic] = (this._topics[topic] || []).filter(function(config) {
                return handler ? config.handler !== handler : config.context !== context
            })
        }
    }
});

module.exports = Dispatcher;
