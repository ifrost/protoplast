(function (window) {
    'use strict';

    window.MainView = window.View.extend({
        
        todos: {
            inject: 'todos'
        },

        html: '<section class="main">' +
            '<input class="toggle-all" data-prop="toggle_all" type="checkbox"></input>' +
            '<label for="toggle-all">Mark all as complete</label>' +
            '<div data-comp="todos_view"></div>' +
        '</section>',
        
        todos_view: {
            component: window.TodosView
        },

        all_checked: {
            get: function() {
                return this.toggle_all.property('checked');
            }
        },

        init: function () {

            this.toggle_all.on('change', this.toggle.bind(this));

            window.Protoplast.utils.bind(this.todos, 'done', this.update_toggle);
        },
        
        toggle: function () {
            this.pub('todos/toggle_all', this.all_checked);
        },

        update_toggle: function () {
            this.toggle_all.property('checked', this.todos.all_done);
            this.toggle_all.style('display', this.todos.all.length ? 'block' : 'none');
        }

    });

})(window);
