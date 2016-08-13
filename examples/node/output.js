var Protoplast = require('protoplast');

var Output = Protoplast.extend({

    data: {
        inject: 'data'
    },

    init: {
        inject_init: true,
        value: function() {
            Protoplast.utils.bind(this.data, 'counter', this.print.bind(this));
        }
    },

    print: function() {
        console.log(this.data.counter);
    }

});

module.exports = Output;