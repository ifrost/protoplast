(function (window) {
    'use strict';

    window.TodosPresenter = window.Presenter.extend({

        app_model: {
            inject: 'appmodel'
        },

        init: function() {
            Protoplast.utils.bind_property(this.app_model, 'visible_todos', this.view, 'visible_todos');
        }

    });

})(window);
