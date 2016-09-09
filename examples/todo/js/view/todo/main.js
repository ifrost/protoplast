(function (window) {
    'use strict';

    window.MainView = window.View.extend({
        
        $meta: {
            presenter: window.MainPresenter
        },

        html: '<section class="main">' +
            '<input class="toggle-all" data-prop="toggle_all" type="checkbox"></input>' +
            '<label for="toggle-all">Mark all as complete</label>' +
            '<div data-comp="todos_view"></div>' +
        '</section>',
        
        todos_view: {
            component: window.TodosView
        },

        todos: null,

        all_checked: {
            get: function() {
                return this.toggle_all.property('checked');
            }
        },

        init: function () {

            this.toggle_all.on('change', this.toggle.bind(this));

            window.Protoplast.utils.bind(this.todos, 'done', this.update_toggle);
            window.Protoplast.utils.bind(this.todos, 'all', this.update_toggle_visibility);
            window.Protoplast.utils.bind(this.todos, 'all', this.update_toggle);
        },
        
        toggle: function () {
            this.dispatch('toggle_all', this.all_checked);
        },

        update_toggle: function () {
            this.toggle_all.property('checked', this.todos.all_done);
        },

        update_toggle_visibility: function() {
            this.toggle_all.style('display', this.todos.all.length ? 'block' : 'none');
        }

    });

})(window);
