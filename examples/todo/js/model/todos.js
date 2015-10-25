(function (window) {
    'use strict';

    window.TodosModel = window.Model.extend(function(proto, base, config){

        config.update_after = ['add', 'remove', 'toggle', 'toggle_all'];

        proto.init = function() {
            this._todos = [];
        };

        proto.add = function(todo) {
            this._todos.push(todo);
        };

        proto.remove = function(todo) {
            this._todos = this._todos.filter(function(t){return t !== todo})
        };

        proto.toggle = function(todo) {
            todo.done = !todo.done;
        };

        proto.toggle_all = function(value) {
            this._todos.forEach(function(todo){
                todo.done = value;
            });
        };

        proto.refresh = function() {
            this._update();
        };

        proto.all = function() {
            return this._todos;
        };

        proto.undone = function() {
            return this._todos.filter(function(todo){return !todo.done});
        };

        proto.done = function() {
            return this._todos.filter(function(todo){return todo.done});
        };

    });

})(window);
