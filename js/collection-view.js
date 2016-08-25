var Model = require('./model');

var CollectionView = Model.extend({
   
    _filters: null,

    length: {
        get: function() {
            return this._current.length;
        }
    },

    $create: function(collection) {
        this._source = collection;
        this._current = [];
        this._filters = [];
        
        this._source.on('changed', this._invalidate, this);

        this.refresh = this.refresh.bind(this);

        this._invalidate({
            added: this._source.toArray()
        });
    },

    refresh: function() {
        this._invalidate();
    },
    
    add_filter: function(fn) {
        this._filters.push(fn);
        this._invalidate();
    },

    get: function(index) {
        return this._current[index];
    },

    toArray: function() {
        return this._current
    },

    concat: function() {
        return this._current.concat.apply(this._current, arguments);
    },

    forEach: function() {
        return this._current.forEach.apply(this._current, arguments);
    },
    
    _invalidate: function(event) {
        
        if (!event) {
            event = {added: this._source.toArray(), removed: this._source.toArray()}
        }
        
        this._current = this._source.toArray();
        
        this._filters.forEach(function(filter) {

            event.removed.forEach(function(item){
                if (filter.properties) {
                    filter.properties.forEach(function(property) {
                        item.off(property + '_changed', this.refresh, this);
                    }, this);
                }
            }, this);

            event.added.forEach(function(item){
                if (filter.properties) {
                    filter.properties.forEach(function(property) {
                        item.on(property + '_changed', this.refresh, this);
                    }, this);
                }
            }, this);

            this._current = this._current.filter(function(item) {
                return filter.fn(item);
            });
        }, this);

        this.dispatch('changed');
    }
    
});

module.exports = CollectionView;