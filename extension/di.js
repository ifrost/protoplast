(function(exports){

    var Dispatcher = exports.Dispatcher;

    var Context = Protoplast.extend(function(proto){

        /**
         * Map of object in the context
         * @type {Object}
         * @private
         */
        proto._objects = null;

        proto.init = function() {
            var self = this;
            this._objects = {
                pub: function (topic, message) {
                    self._dispatcher.dispatch(topic, message);
                },
                sub: function (topic) {
                    var instance_self = this;
                    return {
                        add: function (handler) {
                            self._dispatcher.on(topic, handler, instance_self);
                        },
                        remove: function (handler) {
                            self._dispatcher.off(topic, handler, instance_self);
                        }
                    }
                }
            };
            this._dispatcher = Dispatcher();
        };

        /**
         * Registers object in the DI context
         * @param {String} id
         * @param {Object} instance
         */
        proto.register = function (id, instance) {
            if (arguments.length == 1) {
                instance = id;
            }
            else {
                this._objects[id] = instance;
            }

            instance.__fastinject__ = function(obj) {
                this.register(obj);
                if (obj.injected instanceof Function) {
                    obj.injected();
                }
            }.bind(this);

            this.inject(instance, instance.__meta__.inject);
        };

        /**
         * Performs dependency injection based on the config
         * @param {Object} instance
         * @param {Object} config - {property:dependencyId,...}
         */
        proto.inject = function(instance, config) {
            var self = this, id;
            for (var property in config) {
                id = config[property];

                (function(id){
                    Object.defineProperty(instance, property, {
                        get: function() {
                            return self._objects[id];
                        }
                    });
                })(id);
            }
        };

        proto.build = function() {
            Object.keys(this._objects).forEach(function(id) {
                var instance = this._objects[id];
                if (instance.injected instanceof Function) {
                    instance.injected();
                }
            }.bind(this));
        };

    });

    exports.Context = Context;

})(window);