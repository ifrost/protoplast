(function (window) {
    'use strict';

    window.FooterPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        view_state: {
            inject: 'viewstate'
        },

        pub: {
            inject: 'pub'
        },

        init: function () {

            this.todos.undone.on('changed', this.update_counter);
            this.update_counter();

            window.Protoplast.utils.bind(this.view_state, 'state', this.view.update_selection);
        },

        clear_all: function() {
            this.pub('todos/clear_done');
        },

        update_counter: function () {
            var count_undone = this.todos.undone.length,
                count_done = this.todos.done.length,
                items = count_undone === 1 ? 'item' : 'items';

            this.view.update_items(count_done, count_undone);
        }

    });

})(window);
