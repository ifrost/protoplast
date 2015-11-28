(function(window) {
    'use strict';

    window.TodosModel = window.Model.extend([window.Storage], {

        $meta: {
            update_after: ['add', 'remove', 'toggle', 'toggle_all', 'refresh']
        },

        $create: function() {
            this.store_id('todos');
            this._todos = this.store_read() || [];
            this.on('updated', this.store, this);
        },

        store: function() {
            this.store_save(this._todos);
        },

        add: function(todo) {
            this._todos.push(todo);
        },

        remove: function(todo) {
            this._todos = this._todos.filter(function(t) {
                return t !== todo;
            });
        },

        toggle: function(todo) {
            todo.done = !todo.done;
        },

        toggle_all: function(value) {
            this._todos.forEach(function(todo) {
                todo.done = value;
            });
        },

        refresh: function() {
        },

        all: function() {
            return this._todos;
        },

        undone: function() {
            return this._todos.filter(function(todo) {
                return !todo.done;
            });
        },

        done: function() {
            return this._todos.filter(function(todo) {
                return todo.done;
            });
        }

    });

    window.Model.auto_update(window.TodosModel);

})(window);
