var constructors = require('./constructors'),
    utils = require('./utils'),
    Model = require('./model');

var Object = Model.extend({
    
    $meta: {
        constructors: [constructors.autobind]
    },
    
    init: {
        injectInit: true,
        value: function() {}
    },
    
    destroy: {
        injectDestroy: true,
        value: function() {}
    },

    bind: function(chain, handler) {
        utils.bind(this, chain, handler);
    },

    bindProperty: function(chain, dest, destChain) {
        utils.bindProperty(this, chain, dest, destChain);
    }
    
});

module.exports = Object;