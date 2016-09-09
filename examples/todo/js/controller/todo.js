(function(window) {
    'use strict';

    window.TodoController = window.Controller.extend({

        todos: {
            inject: 'todos'
        },

        add_todo: function(text) {
            this.todos.add(window.TodoModel.create(text));
        },

        toggle_todo: function(todo) {
            this.todos.toggle(todo);
        },

        toggle_all: function(value) {
            this.todos.toggle_all(value);
        },

        remove_todo: function(todo) {
            this.todos.remove(todo);
        },

        clear_done: function() {
            this.todos.done.concat().forEach(function(todo) {
                this.remove_todo(todo);
            }, this);
        },

        edit_todo: function(data) {
            this.todos.edit_todo_text(data.todo, data.text);
        }
    });

})(window);
