(function (window) {
    'use strict';

    window.FooterView = window.View.extend({

        tag: 'footer',

        __meta__: {
            inject: {
                todos: 'todos',
                view_state: 'viewstate'
            }
        },

        create: function() {

            this.$root.classed('footer', true);

            this.counter = this.$root.append('span').classed('todo-count', true);
            this.filters = this.$root.append('ul').classed('filters', true);
            this.filter_all = this.filters.append('li').append('a').attr('href', '#/').text('All');
            this.filter_undone = this.filters.append('li').append('a').attr('href', '#/active').text('Active');
            this.filter_done = this.filters.append('li').append('a').attr('href', '#/completed').text('Completed');

            this.clear_all = this.$root
                .append('button')
                .classed('clear-completed', true)
                .text('Clear completed')
                .on('click', this.pub.bind(this, 'todos/clear_done'));

            this.todos.on('updated', this.update_counter, this);
            this.update_counter();

            this.view_state.on('updated', this.update_selection, this);
            this.update_selection();
        },

        update_selection: function() {
            this.filter_all.classed('selected', this.view_state.get_state() === window.ViewStateModel.ALL);
            this.filter_undone.classed('selected', this.view_state.get_state() === window.ViewStateModel.UNDONE);
            this.filter_done.classed('selected', this.view_state.get_state() === window.ViewStateModel.DONE);
        },

        update_counter: function() {
            var count_undone = this.todos.undone().length,
                count_all = this.todos.all().length,
                count_done = this.todos.done().length,
                items = count_undone === 1 ? 'item' : 'items';

            this.counter.html('<strong>' + count_undone + '</strong> ' + items + ' left');
            this.$root.style('display', count_all ? 'block' : 'none');
            this.clear_all.style('display', count_done ? 'block' : 'none')
        }

    });

})(window);
