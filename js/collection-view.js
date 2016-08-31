var Model = require('./model');

var CollectionView = Model.extend({

    _filters: null,

    _sort: null,

    _hidden_selected: null,
    
    selected: null,

    length: {
        get: function() {
            return this._current.length;
        }
    },

    $create: function(collection) {
        this._source = collection;
        this._current = [];
        this._filters = [];
        this._sort = [];

        this._source.on('changed', this._invalidate, this);

        this.refresh = this.refresh.bind(this);

        this._invalidate({
            added: this._source.toArray()
        });
    },

    refresh: function() {
        this._invalidate();
    },

    add_filter: function(filter) {
        this._filters.push(filter);
        this._invalidate();
    },

    remove_filter: function(filter) {
        var index = this._filters.indexOf(filter);
        if (index !== -1) {
            this._filters.splice(index, 1);
            this._invalidate();
        }
    },

    add_sort: function(sort) {
        this._sort.push(sort);
        this._invalidate();
    },

    remove_sort: function(sort) {
        var index = this._sort.indexOf(sort);
        if (index !== -1) {
            this._sort.splice(index, 1);
        }
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

    _resubscribe: function(filter_or_sort, event) {
        event.removed.forEach(function(item) {
            if (filter_or_sort.properties) {
                filter_or_sort.properties.forEach(function(property) {
                    item.off(property + '_changed', this.refresh, this);
                }, this);
            }
        }, this);

        event.added.forEach(function(item) {
            if (filter_or_sort.properties) {
                filter_or_sort.properties.forEach(function(property) {
                    item.on(property + '_changed', this.refresh, this);
                }, this);
            }
        }, this);
    },

    _invalidate: function(event) {

        if (!event) {
            event = {added: this._source.toArray(), removed: this._source.toArray()}
        }

        this._current = this._source.toArray();

        this._filters.forEach(function(filter) {
            this._resubscribe(filter, event);
            this._current = this._current.filter(function(item) {
                return filter.fn(item);
            });

        }, this);

        if (this._sort.length) {
            this._sort.forEach(function(sort) {
                this._resubscribe(sort, event);
            }, this);

            this._current.sort(function(a, b) {
                var sorts = this._sort.concat();
                var result = 0, sort = sorts.shift();
                
                while (result === 0 && sort) {
                    result = sort.fn(a, b);
                    sort = sorts.shift();
                }

                return result;
            }.bind(this));
        }
        
        if (this.selected && this._current.indexOf(this.selected) === -1) {
            this._hidden_selected = this.selected;
            this.selected = null;
        }
        else if (!this.selected && this._hidden_selected && this._current.indexOf(this._hidden_selected) !== -1) {
            this.selected = this._hidden_selected;
            this._hidden_selected = null;
        }
        
        this.dispatch('changed');
    }

});

module.exports = CollectionView;