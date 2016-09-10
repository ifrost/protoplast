(function(window) {
    'use strict';

    window.TodoController = window.Controller.extend({

        todos: {
            inject: 'todos'
        },

        addTodo: function(text) {
            this.todos.add(window.TodoModel.create(text));
        },

        toggleTodo: function(todo) {
            this.todos.toggle(todo);
        },

        toggleAll: function(value) {
            this.todos.toggleAll(value);
        },

        removeTodo: function(todo) {
            this.todos.remove(todo);
        },

        clearDone: function() {
            this.todos.done.forEach(function(todo) {
                this.removeTodo(todo);
            }, this);
        },

        editTodo: function(data) {
            this.todos.editTodoText(data.todo, data.text);
        }
    });

})(window);
