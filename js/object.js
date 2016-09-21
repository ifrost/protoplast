var constructors = require('./constructors'),
    Model = require('./model');

var Object = Model.extend({
    
    $meta: {
        constructors: [constructors.autobind]
    },
    
    init: {
        injectInit: true,
        value: function() {}
    }
    
});

module.exports = Object;