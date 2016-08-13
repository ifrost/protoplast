var Model = require('protoplast').Model;

var Data = Model.extend({

    counter: null,

    $create: function() {
        this.counter = 0;
    }

});

module.exports = Data;