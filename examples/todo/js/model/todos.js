(function (window) {
    'use strict';

    window.TodosModel = window.Model.extend([window.Storage], function(proto, base, meta){

        meta.update_after = ['add', 'remove', 'toggle', 'toggle_all', 'refresh'];

        proto.init = function() {
            this.store_id('todos');
            this._todos = this.store_read() || [];
            this.on('updated', this.store, this);
        };

        proto.store = function() {
            this.store_save(this._todos);
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

        proto.refresh = function() {};

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

    window.Model.auto_update(window.TodosModel);

})(window);
