(function (window) {
    'use strict';

    window.MainPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        controller: {
            inject: 'todocontroller'
        },
        
        init: function () {
            window.Protoplast.utils.bind(this, {
                'todos.all': [this.update_toggle, this.update_toggle_visibility],
                'todos.done': this.update_toggle
            });
            
            this.view.on('toggle_all', this.controller.toggle_all.bind(this.controller));
        },

        update_toggle_visibility: function() {
            this.view.show_toggle = this.todos.all.length;
        },

        update_toggle: function() {
            this.view.all_checked = this.todos.all.length === this.todos.done.length;
        }

    });

})(window);
