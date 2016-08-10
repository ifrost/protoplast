(function (window) {
    'use strict';

    window.MainView = window.View.extend({

        $meta: {
            tag: 'main-view'
        },
        
        todos: {
            inject: 'todos'
        },

        html: '<section class="main">' +
            '<input class="toggle-all" data-prop="toggle_all" type="checkbox"></input>' +
            '<label for="toggle-all">Mark all as complete</label>' +
            '<todos-view></todos-view>' +
        '</section>',

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
