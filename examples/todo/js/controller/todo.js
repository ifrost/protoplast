(function(window) {
    'use strict';

    window.TodoController = window.Controller.extend({

        __meta__: {
            inject: {todos: 'todos'}
        },

        injected: function() {
            this.sub('todos/add').add(this.add_todo, this);
            this.sub('todos/edit').add(this.edit_todo, this);
            this.sub('todos/toggle').add(this.toggle_todo, this);
            this.sub('todos/toggle_all').add(this.toggle_all, this);
            this.sub('todos/remove').add(this.remove_todo, this);
            this.sub('todos/clear_done').add(this.clear_done, this);
        },

        add_todo: function(text) {
            this.todos.add({text: text, done: false});
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
            this.todos.done().forEach(function(todo) {
                this.remove_todo(todo);
            }, this)
        },

        edit_todo: function(data) {
            data.todo.text = data.text;
            this.todos.refresh();
        }
    });

})(window);
