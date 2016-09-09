(function (window) {
    'use strict';

    window.HeaderPresenter = window.Presenter.extend({

        controller: {
            inject: 'todocontroller'
        },

        init: function () {
            this.view.on('submit', this.submit_todo);
        },

        submit_todo: function(text) {
            this.controller.add_todo(text);
        }

    });

})(window);
