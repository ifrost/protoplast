
var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher');

var Context = Protoplast.extend({

    $create: function() {
        var self = this;
        this._objects = {
            pub: function(topic, message) {
                self._dispatcher.dispatch(topic, message);
            },
            sub: function(topic) {
                var instance_self = this;
                return {
                    add: function(handler) {
                        self._dispatcher.on(topic, handler, instance_self);
                    },
                    remove: function(handler) {
                        self._dispatcher.off(topic, handler, instance_self);
                    }
                };
            }
        };

        this._dispatcher = Dispatcher.create();
    },

    /**
     * Map of object in the context
     * @type {Object}
     * @private
     */
    _objects: null,

    /**
     * Registers object in the DI context
     * @param {String} [id]
     * @param {Object} instance
     */
    register: function(id, instance) {
        if (arguments.length == 1) {
            instance = id;
        }
        else {
            this._objects[id] = instance;
        }

        instance.__fastinject__ = function(obj) {
            this.register(obj);
            this.process(obj);
        }.bind(this);

        if (instance.$meta.inject) {
            this.inject(instance, instance.$meta.inject);
        }

    },

    process: function(obj) {
        if (obj.$meta && obj.$meta.inject_init) {
            Object.keys(obj.$meta.inject_init).forEach(function(handler){
                obj[handler]();
            }, this);
        }
        if (obj.$meta && obj.$meta.sub) {
            Object.keys(obj.$meta.sub).forEach(function(handler){
                this._objects.sub.call(obj, obj.$meta.sub[handler]).add(obj[handler]);
            }, this);
        }
    },

    /**
     * Performs dependency injection based on the config
     * @param {Object} instance
     * @param {Object} config - {property:dependencyId,...}
     */
    inject: function(instance, config) {
        var self = this, id;
        for (var property in config) {
            if (config.hasOwnProperty(property)) {
                id = config[property];

                (function(id) {
                    Object.defineProperty(instance, property, {
                        get: function() {
                            return self._objects[id];
                        }
                    });
                })(id);
            }
        }
    },

    build: function() {
        Object.keys(this._objects).forEach(function(id) {
            var instance = this._objects[id];
            this.process(instance);
        }.bind(this));
    }

});

module.exports = Context;

