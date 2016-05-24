(function (window) {
    'use strict';

    window.FooterView = window.View.extend({

        todos: {
            inject: 'todos'
        },

        view_state: {
            inject: 'viewstate'
        },

        html: '<footer class="footer">' +
            '<span class="todo-count" data-prop="counter"></span>' +
            '<ul class="filters" data-prop="filters">' +
            '<li><a data-prop="filter_all" href="#/">All</a></li>' +
            '<li><a data-prop="filter_undone" href="#/active">Active</a></li>' +
            '<li><a data-prop="filter_done" href="#/completed">Completed</a></li>' +
            '</ul>' +
            '<button class="clear-completed" data-prop="clear_all">Clear completed</button>' +
            '</footer>',

        init: function () {

            this.clear_all.on('click', this.pub.bind(this, 'todos/clear_done'));

            this.todos.on('updated', this.update_counter);
            this.update_counter();

            this.view_state.on('updated', this.update_selection);
            this.update_selection();
        },

        update_selection: function () {
            this.filter_all.classed('selected', this.view_state.get_state() === window.ViewStateModel.ALL);
            this.filter_undone.classed('selected', this.view_state.get_state() === window.ViewStateModel.UNDONE);
            this.filter_done.classed('selected', this.view_state.get_state() === window.ViewStateModel.DONE);
        },

        update_counter: function () {
            var count_undone = this.todos.undone().length,
                count_all = this.todos.all().length,
                count_done = this.todos.done().length,
                items = count_undone === 1 ? 'item' : 'items';

            this.counter.html('<strong>' + count_undone + '</strong> ' + items + ' left');
            this.$root.style('display', count_all ? 'block' : 'none');
            this.clear_all.style('display', count_done ? 'block' : 'none');
        }

    });

})(window);
