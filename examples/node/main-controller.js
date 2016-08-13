var Protoplast = require('protoplast');

var MainController = Protoplast.extend({

    data: {
        inject: 'data'
    },

    startCounter: {
        inject_init: true,
        value: function() {
            console.log('setting interval');
            setInterval(function() {
                this.data.counter++;
            }.bind(this), 1000);
        }
    }

});

module.exports = MainController;