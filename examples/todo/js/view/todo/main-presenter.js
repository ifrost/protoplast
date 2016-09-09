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
            window.Protoplast.utils.bind_property(this, 'todos', this.view, 'todos');
            
            this.view.update_toggle();
            this.view.on('toggle_all', this.controller.toggle_all.bind(this.controller));
        },
        
        update_counter: function () {
            this.view.done = this.todos.done.length;
            this.view.undone = this.todos.undone.length;
        }

    });

})(window);
