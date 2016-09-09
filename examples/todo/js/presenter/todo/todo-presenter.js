(function (window) {
    'use strict';

    window.TodoPresenter = window.Presenter.extend({

        controller: {
            inject: 'todocontroller'
        },

        init: function () {
            this.view.on('toggle', this.controller.toggle_todo.bind(this.controller));
            this.view.on('remove', this.controller.remove_todo.bind(this.controller));
            this.view.on('edit', this.controller.edit_todo.bind(this.controller));
        }

    });

})(window);
