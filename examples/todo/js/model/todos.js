(function(window) {
    'use strict';

    var auto_update = window.Model.auto_update;

    window.TodosModel = window.Model.extend([window.Storage], {

        $create: function() {
            this.store_id('todos');
            this._todos = this.store_read() || [];
            this.on('updated', this.store, this);
        },

        store: function() {
            this.store_save(this._todos);
        },

        add: {
            hooks: [auto_update],
            value: function(todo) {
                this._todos.push(todo);
            }
        },

        remove: {
            hooks: [auto_update],
            value: function(todo) {
                this._todos = this._todos.filter(function(t) {
                    return t !== todo;
                });
            }
        },

        toggle: {
            hooks: [auto_update],
            value: function(todo) {
                todo.done = !todo.done;
            }
        },

        toggle_all: {
            hooks: [auto_update],
            value: function(value) {
                this._todos.forEach(function(todo) {
                    todo.done = value;
                });
            }
        },

        refresh: {
            hooks: [auto_update],
            value: function() {
            }
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

})(window);
