var Model = require('./model');

var CollectionView = Model.extend({

    _filters: null,

    _sort: null,

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

    add_filter: function(fn) {
        this._filters.push(fn);
        this._invalidate();
    },

    add_sort: function(fn) {
        this._sort.push(fn);
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

        this.dispatch('changed');
    }

});

module.exports = CollectionView;