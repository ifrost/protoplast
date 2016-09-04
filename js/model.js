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

var define_properties = {
    def: function(name, desc, proto) {
        if (proto.$meta.properties.computed && proto.$meta.properties.computed[name]) {
            define_computed_property(name, desc);
        }
        else if (!desc.get && (!desc.value || ['number', 'boolean', 'string'].indexOf(typeof(desc.value)) !== -1)) {
            define_bindable_property(name, desc, proto);
        }
    }
};

var Model = Protoplast.extend([Dispatcher], {

    $meta: {
        hooks: [define_properties]
    },
    
    invalidate_injected_bindings: {
        inject_init: true,
        value: function() {
            for (var computed_property in this.$meta.properties.inject) {
                this.dispatch(computed_property + '_changed');
            }
        }
    },

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
    }

});

module.exports = Model;