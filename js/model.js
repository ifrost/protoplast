var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher'),
    utils = require('./utils');

function define_computed_property(name, desc) {
    var calc = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        if (this['_' + name] === undefined) {
            this['_' + name] = calc.call(this);
        }
        return this['_' + name];
    };

    desc.set = function() {
        var old = this['_' + name];
        this['_' + name] = undefined;
        this.dispatch(name + '_changed', undefined, old);
    }
}

function define_bindable_property(name, desc, proto) {
    var initial_value = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        return this['_' + name];
    };
    desc.set = function(value) {
        if (value !== this['_' + name]) {
            var old = this['_' + name];
            this['_' + name] = value;
            this.dispatch(name + '_changed', value, old);
        }
    };
    proto['_' + name] = initial_value;
}

var Model = Protoplast.extend([Dispatcher], {

    $create: function() {
        for (var computed_property in this.$meta.properties.computed) {
            this.$meta.properties.computed[computed_property].forEach(function(chain) {
                (function(){
                    utils.bind(this, chain, function() {
                        this[computed_property] = undefined;
                    }.bind(this));
                }.bind(this))(computed_property);
            }, this);
        }
    },

    $define_property: function(property, desc) {

        if (this.$meta.properties.computed && this.$meta.properties.computed[property]) {
            define_computed_property(property, desc);
        }
        else if (!desc.get || ['number', 'boolean', 'string'].indexOf(typeof(desc.value)) !== -1) {
            define_bindable_property(property, desc, this);
        }

        Protoplast.$define_property.call(this, property, desc);
    }

});

module.exports = Model;