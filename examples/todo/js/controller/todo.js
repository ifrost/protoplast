(function (window) {
    'use strict';

    window.TodoController = window.Controller.extend(function(proto, base, meta){
        meta.inject = {todos: 'todos'};

        proto.injected = function() {
            this.sub('todos/add').add(this.add_todo, this);
            this.sub('todos/edit').add(this.edit_todo, this);
            this.sub('todos/toggle').add(this.toggle_todo, this);
            this.sub('todos/toggle_all').add(this.toggle_all, this);
            this.sub('todos/remove').add(this.remove_todo, this);
            this.sub('todos/clear_done').add(this.clear_done, this);
        };

        proto.add_todo = function(text) {
            this.todos.add({text: text, done: false});
        };

        proto.toggle_todo = function(todo) {
            this.todos.toggle(todo);
        };

        proto.toggle_all = function(value) {
            this.todos.toggle_all(value);
        };

        proto.remove_todo = function(todo) {
            this.todos.remove(todo);
        };

        proto.clear_done = function() {
            this.todos.done().forEach(function(todo){
                this.remove_todo(todo);
            }, this)
        };

        proto.edit_todo = function(data) {
            data.todo.text = data.text;
            this.todos.refresh();
        };
    });

})(window);
