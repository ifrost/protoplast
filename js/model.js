var Protoplast = require("./protoplast"),
    Dispatcher = require("./dispatcher"),
    utils = require("./utils");

function defineComputedProperty(name, desc, isLazy) {
    var calc = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        if (this["_" + name] === undefined) {
            this["_" + name] = calc.call(this);
        }
        return this["_" + name];
    };

    if (isLazy) {
        desc.set = function() {
            var old = this["_" + name];
            this["_" + name] = undefined;
            this.dispatch(name + "_changed", undefined, old);
        };
    }
    else {
        desc.set = function() {
            var value, old;
            old = this["_" + name];
            this["_" + name] = undefined;
            value = this[name];
            if (value !== old) {
                this.dispatch(name + "_changed", value, old);
            }
        };
    }
}

function defineBindableProperty(name, desc, proto) {
    var initialValue = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        return this["_" + name];
    };
    desc.set = function(value) {
        if (value !== this["_" + name]) {
            var old = this["_" + name];
            this["_" + name] = value;
            this.dispatch(name + "_changed", value, old);
        }
    };
    proto["_" + name] = initialValue;
}

// TODO: destroy bindings
var Model = Protoplast.extend([Dispatcher], {

    $create: function() {
        var computed = this.$meta.properties.computed;
        for (var computedProperty in computed) {
            if (computed.hasOwnProperty(computedProperty)) {
                computed[computedProperty].forEach(function(chain) {
                    (function(name){
                        utils.observe(this, chain, function() {
                            this[name] = undefined;
                        }.bind(this));
                    }.bind(this))(computedProperty);
                }, this);
            }
        }
    },

    $defineProperty: function(property, desc) {

        if (this.$meta.properties.computed && this.$meta.properties.computed[property]) {
            var isLazy = this.$meta.properties.lazy && this.$meta.properties.lazy[property];
            defineComputedProperty(property, desc, isLazy);
        }
        else if (!desc.get || ["number", "boolean", "string"].indexOf(typeof(desc.value)) !== -1) {
            defineBindableProperty(property, desc, this);
        }

        Protoplast.$defineProperty.call(this, property, desc);
    }

});

module.exports = Model;