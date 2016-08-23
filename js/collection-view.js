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
        
        this._invalidate({
            added: this._source.toArray()
        });
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
    
    _invalidate: function(event) {
        
        if (!event) {
            event = {added: this._source.toArray()}
        }
        
        this._current = this._source.toArray();
        
        this._filters.forEach(function(filter) {

            event.added.forEach(function(item){
                if (filter.properties) {
                    filter.properties.forEach(function(property) {
                        item.on(property + '_changed', this._invalidate.bind(this, undefined), this);
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