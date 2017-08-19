(function (window) {
    'use strict';

    window.TodosPresenter = window.Presenter.extend({

        appModel: {
            inject: 'appmodel'
        },

        init: function() {
            Protoplast.utils.bindProperty(this.appModel, 'visibleTodos', this.view, 'visibleTodos');
        }

    });

})(window);
