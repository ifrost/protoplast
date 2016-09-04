(function (window) {
    'use strict';

    window.FooterView = window.View.extend({

        $meta: {
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

        state: null,

        done: null,

        undone: null,

        all: {
            computed: ['done', 'undone'],
            value: function() {
                return this.done + this.undone;
            }
        },

        init: function () {
            this.clear_all.on('click', function() {
                this.dispatch('clear_all');
            }.bind(this));

            window.Protoplast.utils.bind(this, 'state', this.update_state);
            window.Protoplast.utils.bind(this, 'all', this.update_visibility);
            window.Protoplast.utils.bind(this, 'done', this.update_counter);
            window.Protoplast.utils.bind(this, 'undone', this.update_counter);
            window.Protoplast.utils.bind(this, 'done', this.update_clear_button);
            window.Protoplast.utils.bind(this, 'undone', this.update_clear_button);
        },

        update_state: function() {
            this.filter_all.classed('selected', this.state === window.ViewStateModel.ALL);
            this.filter_undone.classed('selected', this.state === window.ViewStateModel.UNDONE);
            this.filter_done.classed('selected', this.state === window.ViewStateModel.DONE);
        },

        update_visibility: function() {
            this.$root.style('display', this.all ? 'block' : 'none');
        },

        update_counter: function() {
            var items = this.undone === 1 ? 'item' : 'items';
            this.counter.html('<strong>' + this.undone + '</strong> ' + items + ' left');
        },

        update_clear_button: function() {
            this.clear_all.style('display', this.done ? 'block' : 'none');
        }
    });

})(window);
