var utils = require('./utils');

/**
 * Collection of constructors
 */
var constructors = {

    /**
     * Add unique id to the object
     */
    uniqueId: function() {
        this.$id = utils.uniqueId(this.$meta.$prefix);
    },

    /**
     * Bind all the function to the instance
     */
    autobind: function () {
        for (var property in this) {
            if (typeof(this[property]) === "function") {
                this[property] = this[property].bind(this);
            }
        }
    }

};

module.exports = constructors;