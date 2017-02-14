var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher');

/**
 * Dependency Injection context builder
 * @type {Object}
 */
var Context = Protoplast.extend({

    $create: function() {
        var self = this;
        this._objects = {
            pub: function(topic, message) {
                self._dispatcher.dispatch(topic, message);
            },
            sub: function(topic) {
                var instanceSelf = this;
                return {
                    add: function(handler) {
                        self._dispatcher.on(topic, handler, instanceSelf);
                    },
                    remove: function(handler) {
                        self._dispatcher.off(topic, handler, instanceSelf);
                    }
                };
            }
        };
        this._unknows = [];

        this._dispatcher = Dispatcher.create();
    },

    /**
     * Map of object in the context
     * @type {Object}
     * @private
     */
    _objects: null,

    /**
     * List of objects added to the registry but having no id
     */
    _unknows: null,

    /**
     * Registers object in the DI context
     * @param {String} [id]
     * @param {Object} instance
     */
    register: function(id, instance) {
        if (arguments.length == 1) {
            instance = id;
            this._unknows.push(instance);
        }
        else {
            this._objects[id] = instance;
        }

        // fast inject is used to register and process new objects after the config has been built
        // any object registered in the config has this method.
        instance.__fastinject__ = function(obj) {
            this.register(obj);
            this.process(obj);
        }.bind(this);
        
    },
    
    _injectDependencies: function(obj) {
        var injectId;
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.inject) {
            Object.keys(obj.$meta.properties.inject).forEach(function(property){
                injectId = obj.$meta.properties.inject[property];
                if (this._objects[injectId]) {
                    obj[property] = this._objects[injectId];
                }
                else if (injectId.isPrototypeOf) {
                    this._unknows.forEach(function(dependency) {
                        if (injectId.isPrototypeOf(dependency)) {
                            obj[property] = dependency;
                        }
                    }, this)
                }
            }, this);
        }
    },

    /**
     * Runs method for each object in context
     * @param method
     * @private
     */
    _runOnAll: function(method) {
        Object.keys(this._objects).forEach(function(id) {
            var instance = this._objects[id];
            method(instance);
        }, this);
        this._unknows.forEach(function(instance){
            method(instance);
        }, this);
    },

    _runInitMethods: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.injectInit) {
            Object.keys(obj.$meta.properties.injectInit).forEach(function(handler){
                obj[handler]();
            }, this);
        }
    },
    
    _runDestroyMethods: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.injectDestroy) {
            Object.keys(obj.$meta.properties.injectDestroy).forEach(function(handler){
                if (obj.$meta.properties.injectDestroy[handler]) {
                    obj[handler]();
                }
            }, this);
        }
    },

    _initialiseSubscriptions: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.sub) {
            Object.keys(obj.$meta.properties.sub).forEach(function(handler){
                this._objects.sub.call(obj, obj.$meta.properties.sub[handler]).add(obj[handler]);
            }, this);
        }
    },

    process: function(obj) {
        this._injectDependencies(obj);
        this._runInitMethods(obj);
        this._initialiseSubscriptions(obj);
    },

    /**
     * Process all objects
     */
    build: function() {
        this._runOnAll(this.process.bind(this));
    },

    /**
     * Destroy all objects in the context
     */
    destroy: function() {
        this._runOnAll(this._runDestroyMethods.bind(this));
    }

});

module.exports = Context;

