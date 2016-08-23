(function(window) {
    'use strict';

    window.TodoController = window.Controller.extend({

        todos: {
            inject: 'todos'
        },

        add_todo: {
            sub: 'todos/add',
            value: function(text) {
                this.todos.add(window.TodoModel.create(text));
            }
        },

        toggle_todo: {
            sub: 'todos/toggle',
            value: function(todo) {
                this.todos.toggle(todo);
            }
        },

        toggle_all: {
            sub: 'todos/toggle_all',
            value: function(value) {
                this.todos.toggle_all(value);
            }
        },

        remove_todo: {
            sub: 'todos/remove',
            value: function(todo) {
                this.todos.remove(todo);
            }
        },

        clear_done: {
            sub: 'todos/clear_done',
            value: function() {
                // TODO: this.todos.concat().each()
                this.todos.done.toArray().concat().forEach(function(todo) {
                    this.remove_todo(todo);
                }, this);
            }
        },

        edit_todo: {
            sub: 'todos/edit',
            value: function(data) {
                data.todo.text = data.text;
            }
        }
    });

})(window);
