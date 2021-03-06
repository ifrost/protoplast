var Model = require("./model");

var Collection = Model.extend({

    $create: function(array) {
        this.array = array || [];
    },

    length: {
        get: function() {
            return this.array.length;
        }
    },

    get: function(index) {
        return this.array[index];
    },

    indexOf: function() {
        return this.array.indexOf.apply(this.array, arguments);
    },

    add: function(item) {
        var result = this.array.push(item);
        this.dispatch("changed", {added: [item], removed: []});
        return result;
    },

    addAll: function(array) {
        array.forEach(this.add, this);
    },
    
    remove: function(item) {
        var index = this.array.indexOf(item);
        if (index !== -1) {
            this.array.splice(index, 1);
            this.dispatch("changed", {added: [], removed: [item]});
        }
    },

    forEach: function(handler, context) {
        return this.array.forEach(handler, context);
    },
    
    concat: function() {
        return Collection.create(this.array.concat.apply(this.array, arguments));
    },

    filter: function(handler, context) {
        return Collection.create(this.array.filter(handler, context));
    },

    toArray: function() {
        return this.array;
    },

    toJSON: function() {
        return this.toArray();
    }

});

module.exports = Collection;