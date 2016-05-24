(function (window) {
    'use strict';

    var TodosView = window.TodosView;

    window.MainView = window.View.extend({

        todos: {
            inject: 'todos'
        },

        html: '<section class="main">' +
            '<input class="toggle-all" data-prop="toggle_all" type="checkbox"></input>' +
            '<label for="toggle-all">Mark all as complete</label>' +
            '<div data-comp="main_view"></div>' +
        '</section>',

        main_view: {
            component: TodosView
        },

        init: function () {

            this.toggle_all.on('change', this.toggle.bind(this));

            this.todos.on('updated', this.update_toggle);
            this.update_toggle();
        },

        toggle: function () {
            this.pub('todos/toggle_all', this.toggle_all.property('checked'));
        },

        update_toggle: function () {
            var checked = this.todos.all().length === this.todos.done().length;
            this.toggle_all.property('checked', checked);
            this.toggle_all.style('display', this.todos.all().length ? 'block' : 'none');
        }

    });

})(window);
