(function (window) {
    'use strict';

    window.FooterPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        view_state: {
            inject: 'viewstate'
        },

        init: function () {
            
            window.Protoplast.utils.bind(this.todos, {
                'undone': this.update_counter,
                'done': this.update_counter
            });
            window.Protoplast.utils.bind_property(this.view_state, 'state', this.view, 'state');

            this.view.on('clear_all', this.clear_all, this);
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
