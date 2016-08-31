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
            
            window.Protoplast.utils.bind_collection(this.todos, 'undone', this.update_counter);
            window.Protoplast.utils.bind(this.view_state, 'state', this.view.update_selection);

            this.view.on('clear_all', this.clear_all, this);
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
