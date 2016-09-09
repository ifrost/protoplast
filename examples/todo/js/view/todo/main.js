(function (window) {
    'use strict';

    window.MainView = window.View.extend({
        
        $meta: {
            presenter: window.MainPresenter
        },

        html: '<section class="main">' +
            '<input class="toggle-all" data-prop="toggle_all" type="checkbox" />' +
            '<label for="toggle-all">Mark all as complete</label>' +
            '<div data-comp="todos_view"></div>' +
        '</section>',
        
        todos_view: {
            component: window.TodosView
        },

        todos: null,

        all_checked: null,

        show_toggle: null,
        
        init: function () {

            this.toggle_all.on('change', this.toggle.bind(this));

            window.Protoplast.utils.bind(this, {
                'all_checked': this.update_toggle,
                'show_toggle': this.update_toggle_visibility
            });
            // window.Protoplast.utils.bind(this.todos, 'done', this.update_toggle);
            // window.Protoplast.utils.bind(this.todos, 'all', this.update_toggle_visibility);
            // window.Protoplast.utils.bind(this.todos, 'all', this.update_toggle);
        },
        
        toggle: function () {
            this.dispatch('toggle_all', this.toggle_all.property('checked'));
        },

        update_toggle: function () {
            this.toggle_all.property('checked', this.all_checked);
        },

        update_toggle_visibility: function() {
            // this.toggle_all.style('display', this.todos.all.length ? 'block' : 'none');
            this.toggle_all.style('display', this.show_toggle ? 'block' : 'none');
        }

    });

})(window);
