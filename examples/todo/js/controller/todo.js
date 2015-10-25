(function (window) {
    'use strict';

    window.TodoController = window.Controller.extend(function(proto, base, config){
        config.inject.get_todos = 'todos';

        proto.init = function() {
            this.sub('todos/add').add(this.add_todo, this);
            this.sub('todos/edit').add(this.edit_todo, this);
            this.sub('todos/toggle').add(this.toggle_todo, this);
            this.sub('todos/remove').add(this.remove_todo, this);
            this.sub('todos/clear_done').add(this.clear_done, this);
        };

        proto.add_todo = function(text) {
            this.get_todos().add({text: text, done: false});
        };

        proto.toggle_todo = function(todo) {
            this.get_todos().toggle(todo);
        };

        proto.remove_todo = function(todo) {
            this.get_todos().remove(todo);
        };

        proto.clear_done = function() {
            this.get_todos().done().forEach(function(todo){
                this.remove_todo(todo);
            }, this)
        };

        proto.edit_todo = function(data) {
            data.todo.text = data.text;
            this.get_todos().refresh();
        };
    });

})(window);
