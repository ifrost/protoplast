(function (window) {
    'use strict';

    window.FooterView = window.View.extend({

        $meta: {
            presenter: window.FooterPresenter
        },

        html: '<footer class="footer">' +
            '<span class="todo-count" data-prop="counter"></span>' +
            '<ul class="filters" data-prop="filters">' +
            '<li><a data-prop="filterAll" href="#/">All</a></li>' +
            '<li><a data-prop="filterUndone" href="#/active">Active</a></li>' +
            '<li><a data-prop="filterDone" href="#/completed">Completed</a></li>' +
            '</ul>' +
            '<button class="clear-completed" data-prop="clearAll">Clear completed</button>' +
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
            this.clearAll.on('click', function() {
                this.dispatch('clearAll');
            }.bind(this));

            window.Protoplast.utils.bind(this, {
                'state': this.updateState,
                'all': this.updateVisibility,
                'done': [this.updateCounter, this.updateClearButton],
                'undone': [this.updateCounter, this.updateClearButton]
            });

        },

        updateState: function() {
            this.filterAll.classed('selected', this.state === window.ViewStateModel.ALL);
            this.filterUndone.classed('selected', this.state === window.ViewStateModel.UNDONE);
            this.filterDone.classed('selected', this.state === window.ViewStateModel.DONE);
        },

        updateVisibility: function() {
            this.$root.style('display', this.all ? 'block' : 'none');
        },

        updateCounter: function() {
            var items = this.undone === 1 ? 'item' : 'items';
            this.counter.html('<strong>' + this.undone + '</strong> ' + items + ' left');
        },

        updateClearButton: function() {
            this.clearAll.style('display', this.done ? 'block' : 'none');
        }
    });

})(window);
