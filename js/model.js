var Protoplast = require('./protoplast'),
    Dispatcher = require('./dispatcher');


var define_properties = {
    def: function(name, desc, proto) {

        if (!desc.value || ['number', 'boolean', 'string', 'function'].indexOf(typeof(desc.value)) !== -1) {
            var initial_value = desc.value;

            delete desc.value;
            delete desc.writable;
            delete desc.enumerable;

            desc.get = function() {
                return this['_' + name];
            };
            desc.set = function(value) {
                if (value !== this['_' + name]) {
                    this['_' + name] = value;
                    this.dispatch(name + '_changed', value);
                }
            };
            proto['_' + name] = initial_value;
        }

    }
};

var Model = Protoplast.extend([Dispatcher], {

    $meta: {
        hooks: [define_properties]
    }

});

module.exports = Model;