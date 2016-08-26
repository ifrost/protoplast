(function (window) {
    'use strict';

    window.FooterView = window.View.extend({

        $meta: {
            tag: 'footer-view',
            presenter: window.FooterPresenter
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
            this.clear_all.on('click', function() {
                this.dispatch('clear_all');
            }.bind(this));
        },

        update_selection: function (state) {
            this.filter_all.classed('selected', state === window.ViewStateModel.ALL);
            this.filter_undone.classed('selected', state === window.ViewStateModel.UNDONE);
            this.filter_done.classed('selected', state === window.ViewStateModel.DONE);
        },

        update_items: function (count_done, count_undone) {
            var count_all = count_done + count_undone,
                items = count_undone === 1 ? 'item' : 'items';

            this.counter.html('<strong>' + count_undone + '</strong> ' + items + ' left');
            this.$root.style('display', count_all ? 'block' : 'none');
            this.clear_all.style('display', count_done ? 'block' : 'none');
        }

    });

})(window);
