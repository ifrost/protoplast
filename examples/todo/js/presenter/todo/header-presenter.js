(function (window) {
    'use strict';

    window.HeaderPresenter = window.Presenter.extend({

        controller: {
            inject: 'todocontroller'
        },

        init: function () {
            this.view.on('submit', this.submitTodo);
        },

        submitTodo: function(text) {
            this.controller.addTodo(text);
        }

    });

})(window);
