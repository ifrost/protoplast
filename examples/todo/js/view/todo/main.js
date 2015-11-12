(function (window) {
    'use strict';

    var TodosView = window.TodosView;

    window.MainView = window.View.extend({

        tag: 'section',

        __meta__: {
            inject: {todos: 'todos'}
        },

        create: function() {

            this.$root.classed('main', true);

            this.toggleAll = this.$root.append('input')
                .classed('toggle-all', true)
                .attr('type', 'checkbox')
                .on('change', this.toggle.bind(this));
            this.$root.append('label').attr('for', 'toggle-all').text('Mark all as complete');

            this.add(new TodosView());
            this.todos.on('updated', this.update_toggle, this);
            this.update_toggle();
        },

        toggle: function() {
            this.pub('todos/toggle_all', this.toggleAll.property('checked'));
        },

        update_toggle: function() {
            var checked = this.todos.all().length === this.todos.done().length;
            this.toggleAll.property('checked', checked);
            this.toggleAll.style('display', this.todos.all().length ? 'block' : 'none');
        }

    });

})(window);
