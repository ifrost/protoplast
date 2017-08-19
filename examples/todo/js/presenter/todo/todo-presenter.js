(function (window) {
    'use strict';

    window.TodoPresenter = window.Presenter.extend({

        controller: {
            inject: 'todocontroller'
        },

        init: function () {
            this.view.on('toggle', this.controller.toggleTodo.bind(this.controller));
            this.view.on('remove', this.controller.removeTodo.bind(this.controller));
            this.view.on('edit', this.controller.editTodo.bind(this.controller));
        }

    });

})(window);
