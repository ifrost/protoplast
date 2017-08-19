var Protoplast = require("./protoplast"),
    Dispatcher = require("./dispatcher");

/**
 * Dependency Injection context builder
 * @type {Object}
 */
var Context = Protoplast.extend({

    $create: function() {
        var self = this;
        this._children = [];
        this._objects = {
            pub: {
                instance: function(topic, message) {
                    self._dispatcher.dispatch(topic, message);
                }
            },
            sub: {
                instance: function(topic) {
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
     * List of children contexts
     */
    _children: null,

    /**
     * Registers object in the DI context
     * @param {String} [id]
     * @param {Object} instance
     */
    register: function(id, instance, opts) {
        if (arguments.length === 1) {
            instance = id;
            this._unknows.push({
                instance: instance,
                readonly: opts && opts.readonly
            });
        }
        else {
            this._objects[id] = {
                instance: instance,
                readonly: opts && opts.readonly
            };
        }

        // fast inject is used to register and process new objects after the config has been built
        // any object registered in the config has this method.
        instance.__fastinject__ = function(obj) {
            this.register(obj);
            this.process(obj);
        }.bind(this);

        this._children.forEach(function(context) {
            context.register(id, instance, {readonly: true});
        });
    },
    
    _injectDependencies: function(obj) {
        var injectId;
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.inject) {
            Object.keys(obj.$meta.properties.inject).forEach(function(property){
                injectId = obj.$meta.properties.inject[property];
                if (this._objects[injectId]) {
                    obj[property] = this._objects[injectId].instance;
                }
                else if (injectId.isPrototypeOf) {
                    var objects = [];
                    Object.keys(this._objects).forEach(function(id) {
                        objects.push(this._objects[id]);
                    }, this);
                    this._unknows.concat(objects).forEach(function(dependencyDescriptor) {
                        if (injectId.isPrototypeOf(dependencyDescriptor.instance)) {
                            obj[property] = dependencyDescriptor.instance;
                        }
                    }, this);
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
        Object.keys(this._objects)
            .filter(function(id) {
                return !this._objects[id].readonly;
            }, this)
            .forEach(function(id) {
                var instance = this._objects[id].instance;
                method(instance);
            }, this);

        this._unknows
            .filter(function(descriptor) {
                return !descriptor.readonly;
            }, this)
            .forEach(function(descriptor){
                method(descriptor.instance);
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
                this._objects.sub.instance.call(obj, obj.$meta.properties.sub[handler]).add(obj[handler]);
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
     * Creates new child context
     * @returns {Context}
     */
    createChildContext: function() {
        var context = Context.create();
        this._children.push(context);
        return context;
    },

    /**
     * Destroy all objects in the context
     */
    destroy: function() {
        this._runOnAll(this._runDestroyMethods.bind(this));
    }

});

module.exports = Context;

