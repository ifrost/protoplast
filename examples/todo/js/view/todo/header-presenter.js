(function (window) {
    'use strict';

    window.HeaderPresenter = window.Presenter.extend({

        init: function () {
            this.view.on('submit', this.submit_todo);
        },

        submit_todo: function(text) {
            this.pub('todos/add', text);
        }

    });

})(window);
