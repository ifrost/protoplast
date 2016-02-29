var utils = require('./utils');

var constructors = {

    uniqueId: function() {
        this.$id = utils.uniqueId(this.$meta.$prefix);
    },

    autobind: function () {
        for (var property in this) {
            if (typeof(this[property]) === "function") {
                this[property] = this[property].bind(this);
            }
        }
    }

};

module.exports = constructors;