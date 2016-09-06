(function (window) {
    'use strict';

    window.MainViewPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        init: function () {
            window.Protoplast.utils.bind_property(this, 'todos', this.view, 'todos');
            this.pub('todos/toggle_all', this.all_checked);

        },

        clear_all: function() {
            this.pub('todos/clear_done');
        },

        update_counter: function () {
            this.view.done = this.todos.done.length;
            this.view.undone = this.todos.undone.length;
        }

    });

})(window);
