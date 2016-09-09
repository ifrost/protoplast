(function (window) {
    'use strict';

    window.FooterPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        controller: {
            inject: 'todocontroller'
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

            this.view.on('clear_all', this.controller.clear_done.bind(this.controller));
        },
        
        update_counter: function () {
            this.view.done = this.todos.done.length;
            this.view.undone = this.todos.undone.length;
        }

    });

})(window);
