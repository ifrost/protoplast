(function (window) {
    'use strict';

    window.FooterView = window.View.extend(function(proto, base, config){

        config.inject.get_todos = 'todos';
        config.inject.get_view_state = 'viewstate';

        proto.init = function(parent) {
            this.root = parent.append('footer').classed('footer', true);

            this.counter = this.root.append('span').classed('todo-count', true);
            this.filters = this.root.append('ul').classed('filters', true);
            this.filter_all = this.filters.append('li').append('a').attr('href', '#/').text('All');
            this.filter_undone = this.filters.append('li').append('a').attr('href', '#/active').text('Active');
            this.filter_done = this.filters.append('li').append('a').attr('href', '#/completed').text('Completed');

            this.root
                .append('button')
                .classed('clear-completed', true)
                .text('Clear completed')
                .on('click', this.pub.bind(this, 'todos/clear_done'));

            this.get_todos().on('updated', this.update_counter, this);
            this.update_counter();

            this.get_view_state().on('updated', this.update_selection, this);
            this.update_selection();
        };

        proto.update_selection = function() {
            this.filter_all.classed('selected', this.get_view_state().get_state() === window.ViewStateModel.ALL);
            this.filter_undone.classed('selected', this.get_view_state().get_state() === window.ViewStateModel.UNDONE);
            this.filter_done.classed('selected', this.get_view_state().get_state() === window.ViewStateModel.DONE);
        };

        proto.update_counter = function() {
            var count_undone = this.get_todos().undone().length,
                count_all = this.get_todos().all().length,
                items = count_undone === 1 ? 'item' : 'items';

            this.counter.html('<strong>' + count_undone + '</strong> ' + items + ' left');
            this.root.style('display', count_all ? 'block' : 'none');
        };

    });

})(window);
